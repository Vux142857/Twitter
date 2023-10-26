import { ObjectId } from 'mongodb'

interface RefreshTokenType {
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
  constructor({ _id, token, user_id, iat, exp, created_at }: RefreshTokenType) {
    const date = new Date()
    this._id = _id || new ObjectId()
    this.token = token || ''
    this.user_id = user_id || ''
    this.iat = new Date(iat * 1000)
    this.exp = new Date(exp * 1000)
    this.created_at = created_at || date
  }
}

export default RefreshToken
