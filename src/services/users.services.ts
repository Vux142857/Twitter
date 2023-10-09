import User from '~/models/schemas/User.schema'
import databaseService from './database/database.services'
import { RegisterReqBody, LoginReqBody } from '~/models/requests/User.requests'
import { signToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import { encryptPassword, comparePassword } from '~/utils/crypto'
import USERS_MESSAGES from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'

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

  private async signAccessAndRefeshToken(user_id: string) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefeshToken(user_id)])
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: await encryptPassword(payload.password),
        verify: UserVerifyStatus.Verified
      })
    )
    const user_id = result.insertedId.toString()
    const [accessToken, refeshToken] = await this.signAccessAndRefeshToken(user_id)
    return {
      accessToken,
      refeshToken
    }
  }

  async login(payload: LoginReqBody) {
    if (payload.email && payload.password) {
      const user = await userService.checkExistedEmail(payload.email)
      if (user && (await comparePassword(payload.password, user.password))) {
        const user_id = user._id.toString()
        const [accessToken, refeshToken] = await this.signAccessAndRefeshToken(user_id)
        return {
          accessToken,
          refeshToken
        }
      }
    } else {
      return
    }
  }

  async checkExistedEmail(email: string) {
    return await databaseService.users.findOne({
      $and: [{ email }, { verify: UserVerifyStatus.Verified }]
    })
  }
}

const userService = new UserService()

export default userService
