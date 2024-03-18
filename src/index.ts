/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer } from 'http'
import http from 'node:http'
import express from 'express'
import cluster from 'cluster'
import { Server } from 'socket.io'
import app from './server'
import 'dotenv/config'
import { Message } from './libs/messageStore'
import { setupMaster, setupWorker } from '@socket.io/sticky'
import { createAdapter, setupPrimary } from '@socket.io/cluster-adapter'
const port = process.env.PORT || 3000
import { availableParallelism } from 'node:os'
import process from 'node:process'
import sessionStore from './libs/sessionStore'
import tokenService from './services/token.services'
import { USER_MESSAGES } from './constants/messages'
const numCPUs = availableParallelism()

interface UserInChat {
  userID: string
  username: string
  connected?: boolean
  messages: Message[]
  self?: boolean
}

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`)
  /**
   * Creating http-server for the master.
   * All the child workers will share the same port (port)
   */
  const server = createServer(app).listen(port)
  // Setting up stick session
  setupMaster(server, {
    loadBalancingMethod: 'least-connection'
  })

  //Setting up communication between workers and primary.
  cluster.setupPrimary({
    serialization: 'advanced'
  })

  // Launching workers based on the number of CPU threads.
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`)
  })
} else {
  /**
   * Setting up the worker threads
   */
  console.log(`Worker ${process.pid} started`)

  /**
   * Creating Express App and Socket.io Server
   * and binding them to HTTP Server.
   */
  const app = express()
  const httpServer = http.createServer(app)
  const io = new Server(httpServer)

  // Using the cluster socket.io adapter.
  io.adapter(createAdapter())

  // Setting up worker connection with the primary thread.
  setupWorker(io)

  io.use(async (socket, next) => {
    const accessToken = socket.handshake.auth.accessToken
    if (accessToken) {
      const decodedAT = await tokenService.decodeAccessToken(accessToken)
      if (decodedAT) {
        return next()
      } else {
        return next(new Error(USER_MESSAGES.ACCESS_TOKEN_EXPIRED))
      }
    }
    return next(new Error(USER_MESSAGES.USER_UNAUTHORIZED))
  })

  io.on('connection', (socket) => {
    const userID = socket.handshake.auth.id
    const username = socket.handshake.auth.username
    sessionStore.saveSession(userID, {
      userID,
      username: username,
      socketID: socket.id,
      connected: true
    })
    const users = sessionStore.findAllSessions()
    socket.emit('users', users)

    socket.on('private message', ({ content, from, to }) => {
      const message: Message = {
        from,
        content,
        to
      }
      console.log('private message', message)
      const toUser = sessionStore.findSession(to)
      if (toUser) {
        socket.to(toUser.socketID).emit('receive message', message)
      }
      // messageStore.saveMessage(message)
    })

    socket.on('disconnect', async () => {
      sessionStore.deleteSession(userID)
      console.log('User disconnected: ' + userID)
    })
  })

  // Handle HTTP Requests
  app.get('/', (req, res) => {
    res.send('Hello world')
  })
}

declare module 'socket.io' {
  interface Socket {
    sessionID?: string
    userID?: string
    username?: string
  }
}
