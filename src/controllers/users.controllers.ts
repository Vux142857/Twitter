import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { RegisterReqBody, LoginReqBody, LogoutReqBody, VerifyEmailToken } from '~/models/requests/User.requests'
import USERS_MESSAGES from '~/constants/messages'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await userService.login(req.body)
  const status = result ? 200 : 401
  const message = result ? USERS_MESSAGES.LOGIN_SUCCESS : USERS_MESSAGES.LOGIN_FAILURE
  res.status(status).json({
    result,
    message
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    result,
    message: USERS_MESSAGES.REGISTER_SUCCESS
  })
}

export const logoutController = async (req: Request<ParamsDictionary, any, LogoutReqBody>, res: Response) => {
  const { refresh_token } = req.body
  const result = await userService.logout(refresh_token)
  res.status(200).json(result)
}

export const verifyEmailValidator = async (req: Request<ParamsDictionary, any, VerifyEmailToken>, res: Response) => {
  const { decoded_verify_email_token } = req
}
