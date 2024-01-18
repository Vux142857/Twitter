import { ObjectId } from 'mongodb'

interface FollowConstructor {
  _id?: ObjectId
  user_id: ObjectId
  following_user_id: ObjectId
  created_at?: Date
}

class Follow {
  _id?: ObjectId
  user_id: ObjectId
  following_user_id: ObjectId
  created_at: Date
  constructor(follow: FollowConstructor) {
    this.user_id = follow.user_id
    this.following_user_id = follow.following_user_id
    this.created_at = follow.created_at || new Date()
  }
}

export default Follow
