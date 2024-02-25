import { TokenPayload } from './models/requests/User.requests'
import { TweetConstructor } from './models/schemas/Tweet.schema'

declare module 'express' {
  interface Request {
    user_id?: string
    decoded_authorization?: TokenPayload
    decoded_refresh_token?: TokenPayload
    decoded_verify_email_token?: TokenPayload
    decoded_forgot_password_token?: TokenPayload
    tweet?: TweetConstructor
  }
}
