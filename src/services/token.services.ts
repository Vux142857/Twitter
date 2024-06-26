import databaseService from './database/database.services'
import { signToken, verifyToken } from '~/utils/jwt'
import { TokenType, UserVerifyStatus } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import 'dotenv/config'

class TokenService {
  // SIGN TOKEN
  async signAccessToken(user_id: string, verify_status?: UserVerifyStatus): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify: verify_status || UserVerifyStatus.Unverified
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED as string
      }
    })
  }

  async signRefreshToken(user_id: string, exp?: number): Promise<string> {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          exp
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
      })
    } else {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
        options: {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRED as string
        }
      })
    }
  }

  async signVerifyEmailToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.VerifyEmailToken
      },
      privateKey: process.env.JWT_SECRET_VERIFY_EMAIL_TOKEN as string,
      options: {
        expiresIn: process.env.VERIFY_EMAIL_TOKEN_EXPIRED as string
      }
    })
  }

  async signForgotPasswordToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRED as string
      }
    })
  }

  async signAccessAndRefreshToken(user_id: string, verify_status?: UserVerifyStatus, exp?: number) {
    return await Promise.all([this.signAccessToken(user_id, verify_status), this.signRefreshToken(user_id, exp)])
  }

  async signTokenForRegister(user_id: string) {
    return await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id),
      this.signVerifyEmailToken(user_id)
    ])
  }

  // STORE TOKEN
  async storeRefreshToken(user_id: string, refreshToken: string) {
    const { iat, exp } = await this.decodeRefreshToken(refreshToken)
    return await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id), iat, exp })
    )
  }

  async storeVerifyEmailToken(user_id: string, verify_email_token: string) {
    return await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: { verify_email_token }
      }
    )
  }

  // DECODE TOKEN
  async decodeRefreshToken(refresh_token: string) {
    return await verifyToken({ token: refresh_token, secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string })
  }

  async decodeAccessToken(access_token: string) {
    return await verifyToken({ token: access_token, secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string })
  }

  async decodeForgotPasswordToken(forgot_password_token: string) {
    return await verifyToken({
      token: forgot_password_token,
      secretKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
    })
  }

  async decodeVerifyEmailToken(verify_email_token: string) {
    return await verifyToken({
      token: verify_email_token,
      secretKey: process.env.JWT_SECRET_VERIFY_EMAIL_TOKEN as string
    })
  }

  // DELETE TOKEN
  async deleteRefreshToken(token: string) {
    return await databaseService.refreshTokens.deleteOne({ token })
  }

  // CHECK TOKEN
  async checkExistedRefreshToken(refreshToken: string) {
    return await databaseService.refreshTokens.findOne({ token: refreshToken })
  }

  async getExpOfRefreshToken(user_id: string) {
    const refreshToken = await databaseService.refreshTokens.findOne({ user_id: new ObjectId(user_id) })
    if (refreshToken) {
      const iat = refreshToken.iat.getTime() / 1000
      const exp = refreshToken.exp.getTime() / 1000
      return { iat, exp }
    }
    return undefined
  }
}

const tokenService = new TokenService()

export default tokenService
