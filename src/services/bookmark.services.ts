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
