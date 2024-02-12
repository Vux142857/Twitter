import { createServer } from 'http'
import cryto from 'crypto'
import { Server } from 'socket.io'
import app from './server'
import 'dotenv/config'
import sessionStore from './lib/sessionStore'
import { ErrorWithStatus } from './models/Error'
import HTTP_STATUS from './constants/httpStatus'
import messageStore from './lib/messageStore'
const port = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

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
    throw new ErrorWithStatus({ message: 'invalid username', status: HTTP_STATUS.NOT_FOUND })
  }
  socket.sessionID = cryto.randomUUID() as string
  socket.userID = userID
  socket.username = username
  next()
})
io.on('connection', (socket) => {
  socket.emit('message', 'Hello from server')
  console.log('user connected ' + socket.handshake.auth.id)
  socket.on('private message', ({ content, to }) => {
    const message = {
      content,
      from: socket.userID,
      to
    }
    socket
      .to(to)
      .to(socket.userID as string)
      .emit('private message', message)
    messageStore.saveMessage(message)
  })
  socket.on('disconnect', () => {
    console.log('user disconnected ' + socket.handshake.auth.id)
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
