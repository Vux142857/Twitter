import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enum'

interface UserType {
  _id?: ObjectId
  name: string
  email: string
  password: string
  // date_of_birth: iso_string
  date_of_birth: Date
  email_verify_token?: string
  forgot_password_token?: string
  bio?: string
  location?: string
  username?: string
  avatar?: string
  cover_photo?: string
  website?: string
  created_at?: Date
  updated_at?: Date
  verify?: UserVerifyStatus
}
export default class User {
  _id?: ObjectId
  name: string
  email: string
  password: string
  date_of_birth: Date
  email_verify_token: string
  forgot_password_token: string
  bio: string
  location: string
  username: string
  avatar: string
  cover_photo: string
  website: string
  created_at: Date
  updated_at: Date
  verify: UserVerifyStatus
  constructor(user: UserType) {
    const date = new Date()
    this._id = user._id || new ObjectId()
    this.name = user.name || ''
    this.email = user.email
    this.password = user.password
    this.date_of_birth = user.date_of_birth || new Date()
    this.email_verify_token = user.email_verify_token || ''
    this.forgot_password_token = user.forgot_password_token || ''
    this.bio = user.bio || ''
    this.location = user.location || ''
    this.username = user.username || ''
    this.avatar = user.avatar || ''
    this.cover_photo = user.cover_photo || ''
    this.website = user.website || ''
    this.created_at = user.created_at || date
    this.updated_at = user.updated_at || date
    this.verify = user.verify || UserVerifyStatus.Unverified
  }
}
