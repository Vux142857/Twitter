import { ObjectId } from 'mongodb'
import Media from '../schemas/Media.schema'
import { TweetAudience, TweetType } from '~/constants/enum'

export interface TweetRequestBody {
  user_id?: ObjectId
  content: string
  media?: Media[]
  mention?: string[]
  hashtag?: ObjectId[]
  audience: TweetAudience
  parent_id?: ObjectId
  type: TweetType
}
