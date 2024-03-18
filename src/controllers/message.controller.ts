/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { MESSAGE_RESPONSE } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import messageService from '~/services/message.service'
import { MessageConstructor } from '~/models/schemas/Message.schema'

export const storeMessageController = async (req: Request, res: Response) => {
  const messageObj: MessageConstructor = {
    to: new ObjectId(req.params.to),
    from: new ObjectId(req.decoded_authorization?.user_id),
    content: req.body.content,
    conversation: new ObjectId(req.body.conversation)
  }
  const result = await messageService.storeMessage(messageObj)
  console.log(result)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? MESSAGE_RESPONSE.MESSAGE_CREATED : MESSAGE_RESPONSE.MESSAGE_CREATED_FAILED
  res.status(status).json({
    result,
    message
  })
}
