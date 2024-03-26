import Follow from '~/models/schemas/Follow.schema'
import databaseService from './database/database.services'
import { ObjectId } from 'mongodb'

class FollowService {
  async getFollowers(user_id: string, skip: number, limit: number) {
    return await databaseService.follows.aggregate(
      [
        {
          '$match': {
            'following_user_id': new ObjectId(user_id)
          }
        }, {
          '$skip': skip
        }, {
          '$limit': limit
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'user_id',
            'foreignField': '_id',
            'as': 'follower_user'
          }
        }, {
          '$addFields': {
            'follower_user': {
              '$map': {
                'input': '$follower_user',
                'as': 'follower_user',
                'in': {
                  '_id': '$$follower_user._id',
                  'name': '$$follower_user.name',
                  'username': '$$follower_user.username',
                  'avatar': '$$follower_user.avatar'
                }
              }
            }
          }
        }, {
          '$addFields': {
            'follower_user': {
              '$arrayElemAt': [
                '$follower_user', 0
              ]
            }
          }
        }
      ]
    ).toArray()
  }

  async getFollowings(user_id: string, skip: number, limit: number) {
    return await databaseService.follows.aggregate(
      [
        {
          '$match': {
            'user_id': new ObjectId(user_id)
          }
        }, {
          '$skip': skip
        }, {
          '$limit': limit
        }, {
          '$lookup': {
            'from': 'users',
            'localField': 'following_user_id',
            'foreignField': '_id',
            'as': 'following_user'
          }
        }, {
          '$addFields': {
            'following_user': {
              '$map': {
                'input': '$following_user',
                'as': 'following_user',
                'in': {
                  '_id': '$$following_user._id',
                  'name': '$$following_user.name',
                  'username': '$$following_user.username',
                  'avatar': '$$following_user.avatar'
                }
              }
            }
          }
        }, {
          '$addFields': {
            'following_user': {
              '$arrayElemAt': [
                '$following_user', 0
              ]
            }
          }
        }
      ]
    ).toArray()
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

  async countFollowers(user_id: string) {
    return await databaseService.follows.countDocuments({
      following_user_id: new ObjectId(user_id)
    })
  }

  async countFollowings(user_id: string) {
    return await databaseService.follows.countDocuments({
      user_id: new ObjectId(user_id)
    })
  }
}

const followService = new FollowService()
export default followService
