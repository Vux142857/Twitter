import { ObjectId } from 'mongodb'

interface BookmarkConstructor {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

class Bookmark {
  _id?: ObjectId
  user_id: ObjectId
  tweet_id: ObjectId
  created_at: Date
  updated_at: Date
  constructor(bookmark: BookmarkConstructor) {
    this._id = bookmark._id || new ObjectId()
    this.user_id = bookmark.user_id
    this.tweet_id = bookmark.tweet_id
    this.created_at = bookmark.created_at || new Date()
    this.updated_at = bookmark.updated_at || new Date()
  }
}

export default Bookmark
