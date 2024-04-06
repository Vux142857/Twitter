/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { MESSAGE_RESPONSE } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import messageService from '~/services/message.service'
import redisService from '~/services/database/redis.services'

export const getMessagesController = async (req: Request, res: Response) => {
  const { conversation_id } = req.params
  const { skip, limit } = req.query
  let result = null
  const cachedMessages = await redisService.getCachedMessagesById(
    conversation_id,
    parseInt(skip as string),
    parseInt(limit as string)
  )
  if (cachedMessages.length === parseInt(limit as string)) {
    const total = await messageService.countTotalMessages(new ObjectId(conversation_id))
    const totalPage = Math.ceil(total / parseInt(limit as string))
    result = { messages: cachedMessages, total, totalPage, skip, limit }
  } else {
    const [messages, total] = await Promise.all([
      messageService.getMessagesByConversationId(
        new ObjectId(conversation_id),
        parseInt(skip as string),
        parseInt(limit as string)
      ),
      messageService.countTotalMessages(new ObjectId(conversation_id))
    ])
    const totalPage = Math.ceil(total / parseInt(limit as string))
    result = { messages: messages.reverse(), total, totalPage, skip, limit }
  }
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? MESSAGE_RESPONSE.GET_MESSAGES_SUCCESS : MESSAGE_RESPONSE.GET_MESSAGES_FAILURE
  res.status(status).json({
    result,
    message
  })
}
