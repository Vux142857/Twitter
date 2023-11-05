import Follow from '~/models/schemas/Follow.schema'
import databaseService from './database/database.services'
import { ObjectId } from 'mongodb'

class FollowService {
  async getFollowers(user_id: string) {
    return await databaseService.follows.find({ following_user_id: new ObjectId(user_id) })
  }

  async getFollowings(user_id: string) {
    return await databaseService.follows.find({ user_id: new ObjectId(user_id) })
  }

  async storeFollow(user_id: string, following_user_id: string) {
    return await databaseService.follows.insertOne(
      new Follow({ user_id: new ObjectId(user_id), following_user_id: new ObjectId(following_user_id) })
    )
  }

  async deleteFollow(user_id: string, following_user_id: string) {
    return await databaseService.follows.deleteOne({
      user_id: new ObjectId(user_id),
      following_user_id: new ObjectId(following_user_id)
    })
  }

  async findFollow(user_id: string, following_user_id: string) {
    return await databaseService.follows.findOne({
      user_id: new ObjectId(user_id),
      following_user_id: new ObjectId(following_user_id)
    })
  }
}

const followService = new FollowService()
export default followService
