import { ObjectId } from 'mongodb'

export interface MessageConstructor {
  _id?: ObjectId
  content: string
  from: ObjectId
  to: ObjectId
  conversation: ObjectId
}

class Message {
  _id?: ObjectId
  content: string
  from: ObjectId
  to: ObjectId
  conversation: ObjectId
  constructor(message: MessageConstructor) {
    this._id = message._id || new ObjectId()
    this.content = message.content
    this.from = message.from
    this.to = message.to
    this.conversation = message.conversation
  }
}

export default Message
