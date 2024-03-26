import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database/database.services'
import { ObjectId } from 'mongodb'

export interface BookmarkReqBody {
  user_id: ObjectId
  tweet_id: ObjectId
}

class BookmarkService {
  async getBookmark(tweet_id: ObjectId, user_id: ObjectId) {
    return await databaseService.bookmarks.findOne({ tweet_id, user_id })
  }

  async getBookmarksList(user_id: ObjectId, skip: number, limit: number) {
    return await databaseService.bookmarks
      .aggregate([
        {
          '$match': {
            'user_id': user_id
          }
        }, {
          '$skip': skip
        }, {
          '$limit': limit
        }, {
          '$lookup': {
            'from': 'tweets',
            'localField': 'tweet_id',
            'foreignField': '_id',
            'as': 'tweet'
          }
        }, {
          '$unwind': {
            'path': '$tweet'
          }
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'tweet.user_id',
            'foreignField': '_id',
            'as': 'author'
          }
        }, {
          '$unwind': {
            'path': '$author'
          }
        }, {
          '$project': {
            'author.password': 0,
            'author.verify_email_token': 0,
            'author.forgot_password_token': 0,
            'author.created_at': 0,
            'author.updated_at': 0
          }
        }, {
          '$sort': {
            'tweet.create_at': -1
          }
        }
      ])
      .toArray()
  }

  async createBookmark(bookmark: BookmarkReqBody) {
    return await databaseService.bookmarks.findOneAndUpdate(
      { user_id: bookmark.user_id, tweet_id: bookmark.tweet_id },
      { $setOnInsert: new Bookmark(bookmark) },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }

  async unbookmark(bookmark: BookmarkReqBody) {
    return await databaseService.bookmarks.findOneAndDelete({ user_id: bookmark.user_id, tweet_id: bookmark.tweet_id })
  }
}

const bookmarkService = new BookmarkService()

export default bookmarkService
