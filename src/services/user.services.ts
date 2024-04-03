import User from '~/models/schemas/User.schema'
import databaseService from './database/database.services'
import tokenService from './token.services'
import { RegisterReqBody, LoginReqBody, UpdateProfileBody } from '~/models/requests/User.requests'
import { encryptPassword, comparePassword } from '~/utils/crypto'
import { FollowFilterQuery, UserVerifyStatus } from '~/constants/enum'
import { USER_MESSAGES } from '~/constants/messages'
import { ObjectId } from 'mongodb'
import followService from './follower.services'
import redisService from './database/redis.services'

class UserService {
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        verify: UserVerifyStatus.Unverified,
        date_of_birth: new Date(payload.date_of_birth),
        password: await encryptPassword(payload.password)
      })
    )
    const user_id = result.insertedId.toString()
    const [accessToken, refreshToken, verifyEmailToken] = await tokenService.signTokenForRegister(user_id)
    await Promise.all([
      tokenService.storeRefreshToken(user_id, refreshToken),
      tokenService.storeVerifyEmailToken(user_id, verifyEmailToken)
    ])
    return {
      accessToken,
      refreshToken,
      verifyEmailToken
    }
  }

  async login(payload: LoginReqBody) {
    const user = await this.checkExistedEmail(payload.email)
    if (user && (await comparePassword(payload.password, user.password))) {
      const user_id = user._id.toString()
      const [accessToken, refreshToken] = await tokenService.signAccessAndRefreshToken(user_id, user.verify)
      await tokenService.storeRefreshToken(user_id, refreshToken)
      return {
        accessToken,
        refreshToken
      }
    }
    return
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USER_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async checkExistedEmail(email: string) {
    return await databaseService.users.findOne({ email })
  }

  async checkExistedUsername(username: string) {
    return await databaseService.users.findOne({ username })
  }

  async checkExistedUser(user_id: string) {
    return await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
  }

  async verifyEmail(user_id: string) {
    const expOfRefreshToken = await tokenService.getExpOfRefreshToken(user_id)
    const expOld = expOfRefreshToken?.exp
    const [token] = await Promise.all([
      tokenService.signAccessAndRefreshToken(user_id, UserVerifyStatus.Verified, expOld),
      await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        { $set: { verify_email_token: '', verify: UserVerifyStatus.Verified, updated_at: '$$NOW' } }
      ])
    ])
    const [accessToken, refreshToken] = token
    await tokenService.storeRefreshToken(user_id, refreshToken)
    return {
      accessToken,
      refreshToken
    }
  }

  async resendVerifyEmailToken(user_id: string) {
    const verifyEmailToken = await tokenService.signVerifyEmailToken(user_id)
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          verify_email_token: verifyEmailToken,
          updated_at: '$$NOW'
        }
      }
    ])
    return {}
  }

  async createForgotPasswordToken(user_id: string) {
    const forgotPasswordToken = await tokenService.signForgotPasswordToken(user_id)
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      {
        $set: {
          forgot_password_token: forgotPasswordToken,
          updated_at: '$$NOW'
        }
      }
    ])
    return {
      forgot_password_token: forgotPasswordToken,
      message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_DONE
    }
  }

  async resetPassword(user_id: string, password: string) {
    const [newPassword, user, expOfRefreshToken] = await Promise.all([
      encryptPassword(password),
      this.checkExistedUser(user_id),
      tokenService.getExpOfRefreshToken(user_id)
    ])
    const expOld = expOfRefreshToken?.exp
    const [token] = await Promise.all([
      tokenService.signAccessAndRefreshToken(user_id, user?.verify, expOld),
      databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        {
          $set: {
            forgot_password_token: '',
            password: newPassword
          },
          $currentDate: { updated_at: true }
        }
      )
    ])
    const [accessToken, refreshToken] = token
    await tokenService.storeRefreshToken(user_id, refreshToken)
    return {
      accessToken,
      refreshToken
    }
  }

  async getUser(user_id: string) {
    return await databaseService.users.findOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        projection: {
          password: 0,
          verify_email_token: 0,
          forgot_password_token: 0
        }
      }
    )
  }

  async updateProfileUser(user_id: string, requestBody: UpdateProfileBody) {
    return await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { ...requestBody, date_of_birth: requestBody.date_of_birth as Date | undefined },
        $currentDate: { updated_at: true }
      }
    )
  }

  async getUserByUsername(username: string) {
    return await databaseService.users.findOne(
      {
        username,
        verify: { $in: [UserVerifyStatus.Verified, UserVerifyStatus.Unverified] }
      },
      {
        projection: {
          password: 0,
          verify_email_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
          verify: 0
        }
      }
    )
  }

  async getAllUsers() {
    return await databaseService.users
      .aggregate<User>([
        {
          $match: {
            $or: [
              {
                verify: UserVerifyStatus.Verified
              },
              {
                verify: UserVerifyStatus.Unverified
              }
            ]
          }
        },
        {
          $project: {
            password: 0,
            verify_email_token: 0,
            forgot_password_token: 0,
            created_at: 0,
            updated_at: 0,
            verify: 0
          }
        }
      ])
      .toArray()
  }

  async followUser(user_id: string, following_user_id: string) {
    return await followService.storeFollow(user_id, following_user_id)
  }

  async unfollowUser(user_id: string, following_user_id: string) {
    return await followService.deleteFollow(user_id, following_user_id)
  }

  private async getFollowers(user_id: string, skip: number, limit: number) {
    return await followService.getFollowers(user_id, skip, limit)
  }

  private async getFollowing(user_id: string, skip: number, limit: number) {
    return await followService.getFollowings(user_id, skip, limit)
  }

  async getFollow(user_id: string, following_user_id: string) {
    return await followService.findFollow(user_id, following_user_id)
  }

  async getFollowList(user_id: string, skip: number, limit: number, type: string) {
    switch (type) {
      case FollowFilterQuery.Followers:
        const [followers, totalFollowers] = await Promise.all([
          this.getFollowers(user_id, skip, limit),
          followService.countFollowers(user_id)
        ])
        return { followers, totalFollowers }
      case FollowFilterQuery.Following:
        const [followings, totalFollowings] = await Promise.all([
          this.getFollowers(user_id, skip, limit),
          followService.countFollowings(user_id)
        ])
        return { followings, totalFollowings }
      default:
        return null
    }
  }

  async updateToken(user_id: string, exp: number, token: string) {
    const [accessToken, refreshToken] = await Promise.all([
      tokenService.signAccessToken(user_id),
      tokenService.signRefreshToken(user_id, exp),
      tokenService.deleteRefreshToken(token)
    ])
    await tokenService.storeRefreshToken(user_id, refreshToken)
    return { accessToken, refreshToken }
  }

  async searchUsers(value: string, skip: number, limit: number) {
    return await databaseService.users.aggregate(
      [
        {
          '$search': {
            'index': 'users',
            'compound': {
              'filter': [
                {
                  'compound': {
                    'should': [
                      {
                        'autocomplete': {
                          'path': 'username',
                          'query': value
                        }
                      }, {
                        'autocomplete': {
                          'path': 'name',
                          'query': value
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        }, {
          '$skip': skip
        }, {
          '$limit': limit
        }, {
          '$project': {
            'password': 0,
            'verify_email_token': 0,
            'forgot_password_token': 0,
            'created_at': 0,
            'updated_at': 0
          }
        }
      ]
    ).toArray()
  }
}

const userService = new UserService()

export default userService
