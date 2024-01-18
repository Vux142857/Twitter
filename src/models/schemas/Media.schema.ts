import { ObjectId } from 'mongodb'
import { MediaType, StatusType } from '~/constants/enum'

export interface MediaConstructor {
  _id?: ObjectId
  user_id?: ObjectId
  type: MediaType
  url: string
  status: StatusType
  created_at?: Date
}

class Media {
  _id?: ObjectId
  user_id?: ObjectId
  type: MediaType
  url: string
  status: StatusType
  created_at?: Date
  constructor(media: MediaConstructor) {
    this.user_id = media.user_id || new ObjectId()
    this.type = media.type
    this.url = media.url
    this.status = media.status
    this.created_at = media.created_at || new Date()
  }
}
export default Media
