import { Router, Request, Response } from 'express'
import { getMessagesController } from '~/controllers/message.controller'
import { messageValidator } from '~/middlewares/message.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'

const messageRouter = Router()

// *********************** GET ***********************

// WIP: 90% - 100%
// Desciption: Get messages by conversation_id
// Route: /api/message/:conversation_id
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: { messages as Message[], total, totalPage, skip, limit }, message}
messageRouter.get('/:conversation_id', accessTokenValidator, messageValidator, wrapAsync(getMessagesController))

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
