import Message from '~/models/schemas/Message.schema'
import databaseService from './database/database.services'

class MessageService {
  async storeMessage(message: Message) {
    return await databaseService.messages.insertOne(new Message(message))
  }
}

const messageService = new MessageService()
export default messageService
