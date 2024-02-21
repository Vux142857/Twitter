import { ObjectId } from 'mongodb'

interface MessageConstructor {
  _id?: ObjectId
  content: string
  from: string
  to: string
  conversation: ObjectId
  fromSelf?: boolean
}

class Message {
  _id: ObjectId
  content: string
  from: string
  to: string
  conversation: ObjectId
  fromSelf: boolean
  constructor(message: MessageConstructor) {
    this._id = message._id || new ObjectId()
    this.content = message.content
    this.from = message.from
    this.to = message.to
    this.conversation = message.conversation
    this.fromSelf = message.fromSelf || false
  }
}

export default Message
