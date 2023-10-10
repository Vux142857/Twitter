import databaseService from './database/database.services'
import { signToken } from '~/utils/jwt'
import { TokenType } from '~/constants/enum'
import RefreshToken from '~/models/schemas/RefreshToken.schema'
import { ObjectId } from 'mongodb'

class TokenService {
  signAccessToken(userID: string): Promise<string> {
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

  signRefeshToken(userID: string): Promise<string> {
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

  async signAccessAndRefeshToken(user_id: string) {
    return await Promise.all([this.signAccessToken(user_id), this.signRefeshToken(user_id)])
  }

  async storeRefreshToken(user_id: string, refeshToken: string) {
    return await databaseService.refreshTokens.insertOne(
      new RefreshToken({ token: refeshToken, user_id: new ObjectId(user_id) })
    )
  }

  async updateRefeshToken(user_id: string, newRefreshToken: string) {
    return await databaseService.refreshTokens.updateOne(
      { user_id: new ObjectId(user_id) },
      { $set: { token: newRefreshToken } }
    )
  }
}

const tokenService = new TokenService()

export default tokenService
