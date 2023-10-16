import databaseService from './database/database.services'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import 'dotenv/config'

class TokenService {
  private signAccessToken(user_id: string): Promise<string> {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRED as string
      }
    })
  }

  private signVerifyEmailToken(user_id: string): Promise<string> {
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

  private signRefreshToken(user_id: string): Promise<string> {
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

  async signAccessAndRefreshToken(user_id: string) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async signAccessAndVerifyEmailToken(user_id: string) {
    return await Promise.all([this.signAccessToken(user_id), this.signVerifyEmailToken(user_id)])
  }

  async signTokenForRegister(user_id: string) {
    return await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id),
      this.signVerifyEmailToken(user_id)
    ])
  }

  async storeRefreshToken(user_id: string, refreshToken: string) {
    return await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id) })
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

  async updateRefreshToken(user_id: string, newRefreshToken: string) {
    return await databaseService.refreshTokens.updateOne(
      { user_id: new ObjectId(user_id) },
      { $set: { token: newRefreshToken } }
    )
  }

  async checkExistedRefreshToken(refreshToken: string) {
    return await databaseService.refreshTokens.findOne({ token: refreshToken })
  }
}

const tokenService = new TokenService()

export default tokenService
