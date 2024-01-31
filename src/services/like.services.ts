import Like from '~/models/schemas/Like.schema'
import databaseService from './database/database.services'
import { ObjectId } from 'mongodb'

export interface LikeReqBody {
  user_id: ObjectId
  tweet_id: ObjectId
}

class LikeService {
  async createLike(like: LikeReqBody) {
    return await databaseService.likes.findOneAndUpdate(
      { user_id: like.user_id, tweet_id: like.tweet_id },
      { $setOnInsert: new Like(like) },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )
  }

  async unlike(like: LikeReqBody) {
    return await databaseService.likes.findOneAndDelete({ user_id: like.user_id, tweet_id: like.tweet_id })
  }
}

const likeService = new LikeService()

export default likeService
