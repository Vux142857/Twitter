/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer } from 'http'
import cryto from 'crypto'
import { Server } from 'socket.io'
import app from './server'
import 'dotenv/config'
import sessionStore from './lib/sessionStore'
import messageStore, { Message } from './lib/messageStore'
const port = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

interface UserInChat {
  userID: string
  username: string
  connected?: boolean
  messages: Message[]
  self?: boolean
}

// io.use((socket, next) => {
//   const sessionID = socket.handshake.auth.sessionID
//   if (sessionID) {
//     const session = sessionStore.findSession(sessionID)
//     console.log(session)
//     if (session) {
//       socket.sessionID = sessionID
//       socket.userID = session.userID
//       socket.username = session.username
//       return next()
//     }
//   }
//   const username = socket.handshake.auth.username
//   const userID = socket.handshake.auth.id
//   console.log(username, userID)
//   if (!username) {
//     return next(new Error('Invalid username'))
//   }
//   socket.sessionID = cryto.randomUUID() as string
//   socket.userID = userID
//   socket.username = username
//   next()
// })
const users: {
  [userID: string]: {
    userID: string
    username: string
    socketID: string
    connected: boolean
  }
} = {}
io.on('connection', (socket) => {
  const userID = socket.handshake.auth.id
  const username = socket.handshake.auth.username
  users[userID] = {
    userID,
    username: username,
    socketID: socket.id,
    connected: true
  }
  console.log(users)

  // // persist session
  // sessionStore.saveSession(socket.sessionID as string, {
  //   userID: socket.userID,
  //   username: socket.username,
  //   connected: true
  // })

  // emit session details
  // socket.emit('session', {
  //   sessionID: socket.sessionID,
  //   userID: socket.userID
  // })

  // join the "userID" room
  // socket.join(socket.userID as string)
  // // fetch existing users
  // const users: UserInChat[] = []
  // const messagesPerUser = new Map()
  // messageStore.findMessagesForUser(socket.userID as string).forEach((message) => {
  //   const { from, to } = message
  //   const otherUser = socket.userID === from ? to : from
  //   if (messagesPerUser.has(otherUser)) {
  //     messagesPerUser.get(otherUser).push(message)
  //   } else {
  //     messagesPerUser.set(otherUser, [message])
  //   }
  // })
  // // if store session by database: then find by ObjectID -> fetch
  // sessionStore.findAllSessions().forEach((session) => {
  //   users.push({
  //     userID: session.userID,
  //     username: session.username,
  //     connected: session.connected,
  //     messages: messagesPerUser.get(session.userID) || []
  //   })
  // })
  socket.emit('users', users)

  socket.on('private message', ({ content, from, to }) => {
    const message: Message = {
      from,
      content,
      to
    }
    console.log('private message', message)
    if (users[to]) {
      socket.to(users[to].socketID).emit('receive message', message)
    }
    // messageStore.saveMessage(message)
  })

  socket.on('disconnect', async () => {
    console.log('User disconnected: ' + users[userID])
    delete users[userID]
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
