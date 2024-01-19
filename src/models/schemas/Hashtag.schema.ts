import { ObjectId } from 'mongodb'

interface HashtagConstructor {
  _id?: ObjectId
  name: string
  created_at?: Date
  updated_at?: Date
}

class Hashtag {
  _id?: ObjectId
  name: string
  created_at: Date
  updated_at: Date
  constructor(hashtag: HashtagConstructor) {
    const date = new Date()
    this._id = hashtag._id || new ObjectId()
    this.name = hashtag.name
    this.created_at = hashtag.created_at || date
    this.updated_at = hashtag.updated_at || date
  }
}

export default Hashtag
