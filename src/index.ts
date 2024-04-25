/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { createServer } from 'http'
import { Server } from 'socket.io'
import os from 'os'
import app from './server'
import 'dotenv/config'
import sessionStore from './libs/sessionStore'
import tokenService from './services/token.services'
import { USER_MESSAGES } from './constants/messages'
import { wrapSocketAsync } from './utils/handler'
import conversationService from './services/conversation.service'
import { ObjectId } from 'mongodb'
import redisService from './services/database/redis.services'
import messageService from './services/message.service'
import { MessageConstructor } from './models/schemas/Message.schema'
import { isDev } from './constants/config'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.UV_THREADPOOL_SIZE = os.cpus().length
const port = process.env.PORT || 3000
const server = createServer(app)
const io = new Server(server, { cors: { origin: isDev ? '*' : process.env.CLIENT_ALIAS } })

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
  try {
    const userID = socket.handshake.auth.id
    const username = socket.handshake.auth.username
    sessionStore.saveSession(userID, {
      userID,
      username: username,
      socketID: socket.id,
    })
    const users: UserInConversation[] = []
    let conversations = await redisService.getCachedConversationById(userID)
    if (conversations && conversations.length < 1) {
      conversations = await conversationService.getConversationsByUserId(new ObjectId(userID))
      if (conversations.length > 0) {
        await Promise.all(conversations.map(async (conversation: any) => {
          await redisService.cacheConversationById(userID, conversation);
        }));
      }
    }

    if (conversations && conversations.length > 0) {
      conversations.map((item: any) => {
        if (item && item.sender && item.receiver) {
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
        }
      })
    }

    socket.emit('users', users)

    socket.on('private message', async ({ content, from, to, conversation_id }) => {
      const message: MessageConstructor = {
        from,
        content,
        to,
        conversation_id: new ObjectId(conversation_id)
      }
      const toUser = sessionStore.findSession(to)
      if (toUser) {
        socket.to(toUser.socketID).emit('receive message', message)
      }
      await Promise.all([
        messageService.storeMessage(message),
        redisService.cacheMessagesById(conversation_id, message)
      ])
    })
    socket.on('disconnect', async () => {
      sessionStore.deleteSession(userID)
      console.log('User disconnected: ' + userID)
    })
  } catch (error) {
    console.log(error)
  }
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