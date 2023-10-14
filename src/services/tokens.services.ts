import databaseService from './database/database.services'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'
import 'dotenv/config'

class TokenService {
  signAccessToken(userID: string): Promise<string> {
    return signToken({
      payload: {
        userID,
        token_type: TokenType.AccessToken
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: '15min'
      }
    })
  }

  signRefreshToken(userID: string): Promise<string> {
    return signToken({
      payload: {
        userID,
        token_type: TokenType.RefreshToken
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: '24h'
      }
    })
  }

  async signAccessAndRefreshToken(user_id: string) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefreshToken(user_id)])
  }

  async storeRefreshToken(user_id: string, refreshToken: string) {
    return await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refreshToken, user_id: new ObjectId(user_id) })
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
