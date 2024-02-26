import databaseService from './database/database.services'
import Tweet from '~/models/schemas/Tweet.schema'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import Media from '~/models/schemas/Media.schema'
import hashtagService from './hashtag.services'

export interface TweetReqBody {
  audience: TweetAudience
  content: string
  media?: Media[]
  mention?: string[]
  parent_id?: ObjectId | null
  hashtag?: string[]
  type: TweetType
}

class TweetService {
  async createTweet(payload: TweetReqBody, user_id: ObjectId) {
    const { type } = payload
    const tweet =
      type !== TweetType.Tweet && payload.parent_id
        ? new Tweet({
            ...payload,
            parent_id: new ObjectId(payload.parent_id),
            user_id
          })
        : new Tweet({
            ...payload,
            user_id
          })
    if (payload.hashtag) {
      await Promise.all([databaseService.tweets.insertOne(tweet), hashtagService.checkAndCreatHashtag(payload.hashtag)])
    } else {
      await databaseService.tweets.insertOne(tweet)
    }
    return tweet
  }

  async getTweetById(id: ObjectId) {
    return await databaseService.tweets.findOne({ _id: id })
  }
}
const tweetService = new TweetService()

export default tweetService
