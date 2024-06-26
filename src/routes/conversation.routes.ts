import { Router, Request, Response } from 'express'
import { enterConversationController, getConversationController, storeConversationController } from '~/controllers/conversation.controller'
import { conversationIdValidator, createConversationValidator } from '~/middlewares/conversation.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'

const conversationRouter = Router()

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Get a conversation
// Route: /api/conversation/:id
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {conversation: Conversation}}, message}
conversationRouter.get('/:id', conversationIdValidator, accessTokenValidator, wrapAsync(getConversationController))

// WIP: 90% - 100%
// Desciption: Get a conversation by users
// Route: /api/conversation/get-conversation/:receiver
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {conversation: Conversation}}, message}
conversationRouter.get('/get-conversation/:receiver', accessTokenValidator, createConversationValidator, wrapAsync(enterConversationController))

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Store a conversation
// Route: /api/conversation/store-conversation/:receiver
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {conversation: Conversation}}, message}
conversationRouter.post('/store-conversation/:receiver', accessTokenValidator, createConversationValidator, wrapAsync(storeConversationController))

// *********************** FOR TESTING ONLY ***********************
conversationRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.conversations.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default conversationRouter