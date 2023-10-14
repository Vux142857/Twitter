import { JwtPayload } from 'jsonwebtoken'
import { UserVerifyStatus } from '~/constants/enum'

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
}
