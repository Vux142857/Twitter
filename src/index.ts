/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer } from 'http'
import agrv from 'minimist'
import { Server } from 'socket.io'
import app from './server'
import 'dotenv/config'
import sessionStore from './libs/sessionStore'
import tokenService from './services/token.services'
import { USER_MESSAGES } from './constants/messages'
const environment = agrv(process.argv.slice(2)).envi
const port = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, { cors: { origin: environment == 'product' ? process.env.CLIENT : '*' } })

interface MessageInChat {
  from: string
  content: string
  to: string
}

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
    const message: MessageInChat = {
      from,
      content,
      to
    }
    console.log('private message', message)
    const toUser = sessionStore.findSession(to)
    if (toUser) {
      socket.to(toUser.socketID).emit('receive message', message)
    }
  })

  socket.on('disconnect', async () => {
    console.log('User disconnected: ' + userID)
    sessionStore.deleteSession(userID)
  })
})
server.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

declare module 'socket.io' {
  interface Socket {
    sessionID?: string
    userID?: string
    username?: string
  }
}
