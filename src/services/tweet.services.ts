import { TweetReqBody } from '~/models/requests/Tweet.requests'
import databaseService from './database/database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'

class TweetService {
  async createTweet(payload: TweetReqBody, user_id: ObjectId) {
    const tweet = await databaseService.tweets.insertOne(
      new Tweet({
        ...payload,
        user_id
      })
    )
    return tweet
  }

  async getTweetById(id: ObjectId) {
    return await databaseService.tweets.findOne({ _id: id })
  }
}
const tweetService = new TweetService()

export default tweetService
