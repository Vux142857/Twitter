import { ObjectId } from 'mongodb'
import Media from '../schemas/Media.schema'
import { TweetAudience, TweetType } from '~/constants/enum'
import Hashtag from '../schemas/Hashtag.schema'

export interface TweetReqBody {
  audience: TweetAudience
  content: string
  media?: Media[]
  mention?: string[]
  parent_id?: ObjectId | null
  hashtag?: Hashtag[]
  type: TweetType
}
