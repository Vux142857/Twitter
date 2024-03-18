import { Router, Request, Response } from 'express'
import { storeMessageController } from '~/controllers/message.controller'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'

const messageRouter = Router()

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Store a message
// Route: /api/message/store-message/:to
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Body: {conversation: ObjectId, content: string}
// Response OK: {data: {result: {message: Message}}, message}
messageRouter.post('/store-message/:to', accessTokenValidator, wrapAsync(storeMessageController))

// *********************** FOR TESTING ONLY ***********************
messageRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.messages.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default messageRouter
