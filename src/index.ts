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
  connected: boolean
  messages: Message[]
  self?: boolean
}

io.use((socket, next) => {
  const sessionID = socket.handshake.auth.sessionID
  if (sessionID) {
    const session = sessionStore.findSession(sessionID)
    if (session) {
      socket.sessionID = sessionID
      socket.userID = session.userID
      socket.username = session.username
      return next()
    }
  }
  const username = socket.handshake.auth.username
  const userID = socket.handshake.auth.id
  if (!username) {
    return next(new Error('Invalid username'))
  }
  socket.sessionID = cryto.randomUUID() as string
  socket.userID = userID
  socket.username = username
  next()
})

io.on('connection', (socket) => {
  socket.emit('message', 'Hello from server')
  // persist session
  sessionStore.saveSession(socket.sessionID as string, {
    userID: socket.userID,
    username: socket.username,
    connected: true
  })

  // emit session details
  socket.emit('session', {
    sessionID: socket.sessionID,
    userID: socket.userID
  })

  // join the "userID" room
  socket.join(socket.userID as string)
  // fetch existing users
  const users: UserInChat[] = []
  const messagesPerUser = new Map()
  messageStore.findMessagesForUser(socket.userID as string).forEach((message) => {
    const { from, to } = message
    const otherUser = socket.userID === from ? to : from
    if (messagesPerUser.has(otherUser)) {
      messagesPerUser.get(otherUser).push(message)
    } else {
      messagesPerUser.set(otherUser, [message])
    }
  })
  sessionStore.findAllSessions().forEach((session) => {
    users.push({
      userID: session.userID,
      username: session.username,
      connected: session.connected,
      messages: messagesPerUser.get(session.userID) || []
    })
  })
  socket.emit('users', users)
  socket.on('private message', ({ content, to }) => {
    const message = {
      content,
      from: socket.userID as string,
      to
    }
    socket
      .to(to)
      .to(socket.userID as string)
      .emit('private message', message)
    messageStore.saveMessage(message)
  })

  socket.on('disconnect', async () => {
    const matchingSockets = await io.in(socket.userID as string).fetchSockets()
    const isDisconnected = matchingSockets.length === 0
    if (isDisconnected) {
      // notify other users
      socket.broadcast.emit('user disconnected', socket.userID)
      // update the connection status of the session
      sessionStore.saveSession(socket.sessionID as string, {
        userID: socket.userID,
        username: socket.username,
        connected: false
      })
    }
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
