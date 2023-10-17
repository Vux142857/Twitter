import User from '~/models/schemas/User.schema'
import databaseService from './database/database.services'
import tokenService from './tokens.services'
import { RegisterReqBody, LoginReqBody } from '~/models/requests/User.requests'
import { encryptPassword, comparePassword } from '~/utils/crypto'
import { UserVerifyStatus } from '~/constants/enum'
import USERS_MESSAGES from '~/constants/messages'
import { ObjectId } from 'mongodb'

class UserService {
  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        date_of_birth: new Date(payload.date_of_birth),
        password: await encryptPassword(payload.password),
        verify: UserVerifyStatus.Unverified
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
    if (payload.email && payload.password) {
      const user = await userService.checkExistedEmail(payload.email)
      if (user && (await comparePassword(payload.password, user.password))) {
        const user_id = user._id.toString()
        const [accessToken, refreshToken] = await tokenService.signAccessAndRefreshToken(user_id)
        await tokenService.storeRefreshToken(user_id, refreshToken)
        return {
          accessToken,
          refreshToken
        }
      }
    }
    return
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    }
  }

  async checkExistedEmail(email: string) {
    return await databaseService.users.findOne({
      email
    })
  }

  async checkExistedUser(user_id: string) {
    return await databaseService.users.findOne({
      _id: new ObjectId(user_id)
    })
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      tokenService.signAccessAndRefreshToken(user_id),
      await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        { $set: { verify_email_token: '', verify: UserVerifyStatus.Verified, updated_at: '$$NOW' } }
      ])
    ])
    const [accessToken, refreshToken] = token
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
    return {
      message: USERS_MESSAGES.RESEND_EMAIL_SUCCESS
    }
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
      message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_DONE
    }
  }
}

const userService = new UserService()

export default userService
