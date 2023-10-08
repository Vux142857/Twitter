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
