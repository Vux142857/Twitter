import Conversation from '~/models/schemas/Conversation.schema'
import databaseService from './database/database.services'
import { Document, ObjectId } from 'mongodb'

class ConversationService {
  private aggreConversationBody: Document[]
  constructor() {
    this.aggreConversationBody = [
      {
        $lookup: {
          from: 'users',
          localField: 'receiver',
          foreignField: '_id',
          as: 'receiver'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'sender',
          foreignField: '_id',
          as: 'sender'
        }
      },
      {
        $addFields: {
          receiver: {
            $map: {
              input: '$receiver',
              as: 'item',
              in: {
                _id: '$$item._id',
                name: '$$item.name',
                username: '$$item.username',
                avatar: '$$item.avatar'
              }
            }
          },
          sender: {
            $map: {
              input: '$sender',
              as: 'item',
              in: {
                _id: '$$item._id',
                name: '$$item.name',
                username: '$$item.username',
                avatar: '$$item.avatar'
              }
            }
          }
        }
      },
      {
        $addFields: {
          sender: {
            $arrayElemAt: ['$sender', 0]
          },
          receiver: {
            $arrayElemAt: ['$receiver', 0]
          }
        }
      }
    ]
  }
  
  async storeConversation(conversation: Conversation) {
    return await databaseService.conversations.insertOne(new Conversation(conversation))
  }

  async getConversationByUsers(self: ObjectId, another: ObjectId) {
    const [conversation] = await databaseService.conversations
      .aggregate([
        {
          $match: {
            $or: [
              {
                sender: self,
                receiver: another
              },
              {
                receiver: self,
                sender: another
              }
            ]
          }
        },
        ...this.aggreConversationBody
      ])
      .toArray()
    return conversation
  }

  async getConversationById(id: ObjectId) {
    const [conversation] = await databaseService.conversations
      .aggregate([
        {
          $match: {
            _id: id
          }
        },
        ...this.aggreConversationBody
      ])
      .toArray()
    return conversation
  }

  async getConversationsByUserId(id: ObjectId) {
    return await databaseService.conversations
      .aggregate(
        [
          {
            $match: {
              $or: [
                {
                  sender: id,
                },
                {
                  receiver: id,
                }
              ]
            }
          },
          ...this.aggreConversationBody
        ])
      .toArray()
  }
}

const conversationService = new ConversationService()
export default conversationService