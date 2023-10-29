import { JwtPayload } from 'jsonwebtoken'
import { UserVerifyStatus } from '~/constants/enum'
import { ParamsDictionary } from 'express-serve-static-core'
export interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
  verify: UserVerifyStatus.Verified
}

export interface LoginReqBody {
  email: string
  password: string
}

export interface LogoutReqBody {
  refresh_token: string
}

export interface VerifyEmailReqBody {
  email_verify_token: string
}

export interface TokenPayload extends JwtPayload {
  token: string
  user_id: string
  exp: number
  iat: number
}

export interface UpdateProfileBody {
  name?: string
  date_of_birth?: string // Data user patch is string
  bio?: string
  location?: string
  username?: string
  avatar?: string
  cover_photo?: string
  website?: string
}

export interface followBody {
  following_user_id: string
}

export interface unfollowParams extends ParamsDictionary {
  following_user_id: string
}
