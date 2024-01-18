import { TweetAudience, TweetType } from '~/constants/enum'
import Media from './Media.schema'
import { Double, ObjectId } from 'mongodb'
import Hashtag from './Hashtag.schema'

interface TweetSchemaType {
  _id?: ObjectId
  user_id: ObjectId
  audience: TweetAudience
  content: string
  media: Media[]
  mention: ObjectId[]
  parent_id: ObjectId
  hashtag: Hashtag[]
  user_views: Double
  guest_views: Double
  type: TweetType
  createdAt: string
  updatedAt: string
}

class Tweet {
  _id?: ObjectId
  user_id: ObjectId
  audience: TweetAudience
  content: string
  media: Media[]
  mention: ObjectId[]
  parent_id: ObjectId
  hashtag: Hashtag[]
  user_views: Double
  guest_views: Double
  type: TweetType
  createdAt: string
  updatedAt: string
  constructor(tweet: TweetSchemaType) {
    const date = new Date()
    this._id = tweet._id || new ObjectId()
    this.user_id = tweet.user_id
    this.audience = tweet.audience
    this.content = tweet.content
    this.media = tweet.media
    this.mention = tweet.mention
    this.parent_id = tweet.parent_id
    this.hashtag = tweet.hashtag
    this.user_views = tweet.user_views
    this.guest_views = tweet.guest_views
    this.type = tweet.type
    this.createdAt = tweet.createdAt || date.toISOString()
    this.updatedAt = tweet.updatedAt || date.toISOString()
  }
}

export default Tweet
