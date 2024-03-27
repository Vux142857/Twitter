import Message, { MessageConstructor } from '~/models/schemas/Message.schema'
import databaseService from './database/database.services'
import { ObjectId } from 'mongodb'

class MessageService {

  async getMessagesByConversationId(conversation_id: ObjectId, skip: number, limit: number) {
    return await databaseService.messages
      .find({ conversation_id })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
  }

  async storeMessage(message: MessageConstructor) {
    return await databaseService.messages.insertOne(new Message(message))
  }

  async countTotalMessages(conversation_id: ObjectId) {
    return await databaseService.messages.countDocuments({
      conversation_id
    })
  }
}

const messageService = new MessageService()
export default messageService
