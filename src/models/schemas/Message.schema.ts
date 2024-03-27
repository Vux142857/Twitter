import { ObjectId } from 'mongodb'

export interface MessageConstructor {
  _id?: ObjectId
  content: string
  from: ObjectId
  to: ObjectId
  conversation_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

class Message {
  _id?: ObjectId
  content: string
  from: ObjectId
  to: ObjectId
  conversation_id: ObjectId
  created_at: Date
  updated_at: Date
  constructor(message: MessageConstructor) {
    this._id = message._id || new ObjectId()
    this.content = message.content
    this.from = message.from
    this.to = message.to
    this.conversation_id = message.conversation_id
    this.created_at = message.created_at || new Date()
    this.updated_at = message.updated_at || new Date()
  }
}

export default Message
