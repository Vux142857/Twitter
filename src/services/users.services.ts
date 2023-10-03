import User from '~/models/schemas/User.schema'
import databaseService from './database/database.services'
import RegisterReqBody from '~/models/requests/User.requests'
import LoginReqBody from '~/models/requests/User.requests'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { hashPassword } from '~/utils/crypto'

class UserService {
  private signAccessToken(userID: string): Promise<string> {
    return signToken({
      payload: {
        userID,
        token_type: TokenType.AccessToken
      },
      options: {
        expiresIn: '15min'
      }
    })
  }

  private signRefeshToken(userID: string): Promise<string> {
    return signToken({
      payload: {
        userID,
        token_type: TokenType.RefeshToken
      },
      options: {
        expiresIn: '24h'
      }
    })
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        verify: UserVerifyStatus.Verified
      })
    )
    const user_id = result.insertedId.toString()
    const [accessToken, refeshToken] = await Promise.all([this.signAccessToken(user_id), this.signRefeshToken(user_id)])
    return {
      accessToken,
      refeshToken
    }
  }

  async checkExistedEmail(email: string) {
    return await databaseService.users.findOne({
      $and: [{ email }, { verify: UserVerifyStatus.Verified }]
    })
  }

  async login(payload: LoginReqBody) {
    if (payload.email && payload.password) {
      const existedUser = await userService.checkExistedEmail(payload.email)
      if (existedUser && existedUser.username === payload.password) {
        const user_id = existedUser._id.toString()
        const [accessToken, refeshToken] = await Promise.all([
          this.signAccessToken(user_id),
          this.signRefeshToken(user_id)
        ])
        return {
          accessToken,
          refeshToken
        }
      }
    } else {
      throw new Error(':((')
    }
  }
}

const userService = new UserService()

export default userService
