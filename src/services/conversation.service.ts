import Conversation from '~/models/schemas/Conversation.schema'
import databaseService from './database/database.services'

class ConversationService {
  async storeConversation(conversation: Conversation) {
    return await databaseService.conversations.insertOne(new Conversation(conversation))
  }
}

const conversationService = new ConversationService()
export default conversationService
