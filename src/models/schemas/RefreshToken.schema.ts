import { ObjectId } from 'mongodb'

interface RefreshTokenConstructor {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  iat: number
  exp: number
  created_at?: Date
}

class RefreshToken {
  _id?: ObjectId
  token: string
  user_id: ObjectId
  iat: Date
  exp: Date
  created_at?: Date
  constructor(refresh_token: RefreshTokenConstructor) {
    this._id = refresh_token._id || new ObjectId()
    this.token = refresh_token.token || ''
    this.user_id = refresh_token.user_id || ''
    this.iat = new Date(refresh_token.iat * 1000)
    this.exp = new Date(refresh_token.exp * 1000)
    this.created_at = refresh_token.created_at || new Date()
  }
}

export default RefreshToken
