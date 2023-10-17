import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  RegisterReqBody,
  LoginReqBody,
  LogoutReqBody,
  VerifyEmailReqBody,
  TokenPayload
} from '~/models/requests/User.requests'
import USERS_MESSAGES from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'

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

export const verifyEmailController = async (req: Request<ParamsDictionary, any, VerifyEmailReqBody>, res: Response) => {
  const { user_id } = req.decoded_verify_email_token as TokenPayload
  const user = await userService.checkExistedUser(user_id)
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  } else if (user && user.verify_email_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await userService.verifyEmail(user?._id.toString() || '')
  res.status(HTTP_STATUS.OK).json({
    message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request<ParamsDictionary, any, TokenPayload>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const [user, result] = await Promise.all([
    userService.checkExistedUser(user_id),
    userService.resendVerifyEmailToken(user_id)
  ])
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USERS_MESSAGES.USER_NOT_FOUND
    })
  } else if (user && user.verify_email_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  res.status(HTTP_STATUS.OK).json(result)
}

export const createForgotPasswordController = async (req: Request<ParamsDictionary, any, string>, res: Response) => {
  const user_id = req.user_id as string
  const result = await userService.createForgotPasswordToken(user_id)
  res.status(HTTP_STATUS.OK).json(result)
}
