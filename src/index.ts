/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer } from 'http'
import { Server } from 'socket.io'
import app from './server'
import 'dotenv/config'
import sessionStore from './libs/sessionStore'
import tokenService from './services/token.services'
import { USER_MESSAGES } from './constants/messages'
import { wrapSocketAsync } from './utils/handler'
import conversationService from './services/conversation.service'
import { ObjectId } from 'mongodb'
import redisService from './services/database/redis.services'
const port = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

interface MessageInChat {
  from: string
  content: string
  to: string
}

interface UserInConversation {
  userID: string
  name: string
  username: string
  avatar: string
  conversation: string
  isOnline?: boolean
}

io.use(
  wrapSocketAsync(async (socket: any, next: any) => {
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
)

io.on('connection', async (socket) => {
  const userID = socket.handshake.auth.id
  const username = socket.handshake.auth.username
  sessionStore.saveSession(userID, {
    userID,
    username: username,
    socketID: socket.id,
  })
  const users: UserInConversation[] = []
  let conversations = await redisService.getCachedConversationById(userID)
  if (conversations.length < 1) {
    conversations = await conversationService.getConversationsByUserId(new ObjectId(userID))
    if (conversations.length > 0) {
      conversations.forEach(async (conversation: any) => {
        await redisService.cacheConversationById(userID, conversation)
      })
    }
  }
  conversations.map((item: any) => {
    if (item.sender._id.toString() === userID) {
      const isOnline = sessionStore.findSession(item.receiver._id.toString()) ? true : false
      users.push({
        userID: item.receiver._id.toString(),
        name: item.receiver.name,
        username: item.receiver.username,
        avatar: item.receiver.avatar,
        conversation: item._id.toString(),
        isOnline
      })
    } else if (item.receiver._id.toString() === userID) {
      const isOnline = sessionStore.findSession(item.sender._id.toString()) ? true : false
      users.push({
        userID: item.sender._id.toString(),
        name: item.sender.name,
        username: item.sender.username,
        avatar: item.sender.avatar,
        conversation: item._id.toString(),
        isOnline
      })
    }
  })
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
    sessionStore.deleteSession(userID)
    console.log('User disconnected: ' + userID)
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
    avatar?: string
  }
}