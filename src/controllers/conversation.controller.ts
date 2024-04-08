/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { CONVERSATION_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import conversationService from '~/services/conversation.service'
import { ConversationConstructor } from '~/models/schemas/Conversation.schema'

export const getConversationController = async (req: Request, res: Response) => {
  const id = req.params.id
  const result = await conversationService.getConversationById(new ObjectId(id))
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? CONVERSATION_MESSAGES.CONVERSATION_FOUND : CONVERSATION_MESSAGES.CONVERSATION_NOT_FOUND
  res.status(status).json({
    result,
    message
  })
}

export const getConversationByUsersController = async (req: Request, res: Response) => {
  const conversation: ConversationConstructor = {
    sender: new ObjectId(req.decoded_authorization?.user_id),
    receiver: new ObjectId(req.params.receiver)
  }
  const result = await conversationService.getConversationByUsers(conversation.sender, conversation.receiver)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result
    ? CONVERSATION_MESSAGES.CONVERSATION_CREATED
    : CONVERSATION_MESSAGES.CONVERSATION_CREATED_FAILED
  res.status(status).json({
    result,
    message
  })
}

export const storeConversationController = async (req: Request, res: Response) => {
  const conversation: ConversationConstructor = {
    sender: new ObjectId(req.decoded_authorization?.user_id),
    receiver: new ObjectId(req.params.receiver)
  }
  const result = await conversationService.storeConversation(conversation)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result
    ? CONVERSATION_MESSAGES.CONVERSATION_CREATED
    : CONVERSATION_MESSAGES.CONVERSATION_CREATED_FAILED
  res.status(status).json({
    result,
    message
  })
}