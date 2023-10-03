import { UserVerifyStatus } from '~/constants/enum'

export default interface RegisterReqBody {
  name: string
  email: string
  password: string
  confirm_password: string
  date_of_birth: Date
  verify: UserVerifyStatus.Verified
}

export default interface LoginReqBody {
  email: string
  password: string
}
