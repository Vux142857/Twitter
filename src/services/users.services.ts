import User from '~/models/schemas/User.schema'
import databaseService from './database/database.services'
import tokenService from './tokens.services'
import { RegisterReqBody, LoginReqBody } from '~/models/requests/User.requests'
import { encryptPassword, comparePassword } from '~/utils/crypto'
import { UserVerifyStatus } from '~/constants/enum'
import USERS_MESSAGES from '~/constants/messages'

class UserService {
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
    const [accessToken, refeshToken] = await tokenService.signAccessAndRefeshToken(user_id)
    await tokenService.storeRefreshToken(user_id, refeshToken)
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
        const [accessToken, refeshToken] = await tokenService.signAccessAndRefeshToken(user_id)
        await tokenService.storeRefreshToken(user_id, refeshToken)
        return {
          accessToken,
          refeshToken
        }
      }
    }
    return
  }

  async logout(refresh_token: string) {
    const result = await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
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
