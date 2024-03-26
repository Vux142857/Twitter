import Conversation from '~/models/schemas/Conversation.schema'
import databaseService from './database/database.services'
import { ObjectId } from 'mongodb'

class ConversationService {
  async storeConversation(conversation: Conversation) {
    return await databaseService.conversations.insertOne(new Conversation(conversation))
  }

  async getConversationsByUserId(userId: ObjectId) {
    return await databaseService.conversations
      .aggregate([
        {
          $match: {
            $or: [
              {
                sender: userId
              },
              {
                receiver: userId
              }
            ]
          }
        },
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
      ])
      .toArray()
  }

  async getConversationById(id: ObjectId) {
    const [conversation] = await databaseService.conversations
      .aggregate([
        {
          $match: {
            _id: id
          }
        },
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
      ])
      .toArray()
    return conversation
  }
}

const conversationService = new ConversationService()
export default conversationService