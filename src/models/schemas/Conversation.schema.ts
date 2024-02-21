import { ObjectId } from 'mongodb'

interface ConversationConstructor {
  _id?: ObjectId
  sender: ObjectId
  receiver: ObjectId
  created_at?: Date
  updated_at?: Date
}

class Conversation {
  _id?: ObjectId
  sender: ObjectId
  receiver: ObjectId
  created_at: Date
  updated_at: Date
  constructor(conservation: ConversationConstructor) {
    this._id = conservation._id || new ObjectId()
    this.sender = conservation.sender
    this.receiver = conservation.receiver
    this.created_at = conservation.created_at || new Date()
    this.updated_at = conservation.updated_at || new Date()
  }
}

export default Conversation
