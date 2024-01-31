import { TweetAudience, TweetType } from '~/constants/enum'
import Media from './Media.schema'
import { Double, ObjectId } from 'mongodb'

interface TweetConstructor {
  _id?: ObjectId
  user_id: ObjectId
  audience: TweetAudience
  content: string
  media?: Media[]
  mention?: string[]
  parent_id?: ObjectId | null
  hashtag?: string[]
  user_views?: Double
  guest_views?: Double
  type: TweetType
  tweet_circle?: ObjectId[]
  createdAt?: Date
  updatedAt?: Date
}

class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  audience: TweetAudience
  content: string
  media: Media[]
  mention: string[]
  parent_id: ObjectId | null
  hashtag: string[]
  user_views: Double
  guest_views: Double
  tweet_circle: ObjectId[]
  type: TweetType
  createdAt: Date
  updatedAt: Date
  constructor(tweet: TweetConstructor) {
    const date = new Date()
    this._id = tweet._id || new ObjectId()
    this.user_id = tweet.user_id
    this.audience = tweet.audience
    this.content = tweet.content
    this.media = tweet.media || []
    this.mention = tweet.mention || []
    this.parent_id = tweet.parent_id || null
    this.hashtag = tweet.hashtag || []
    this.user_views = tweet.user_views || new Double(0.0)
    this.guest_views = tweet.guest_views || new Double(0.0)
    this.tweet_circle = tweet.tweet_circle || []
    this.type = tweet.type
    this.createdAt = tweet.createdAt || date
    this.updatedAt = tweet.updatedAt || date
  }
}

export default Tweet
