import { Request, Response } from 'express'
import userService from '~/services/user.services'
import { ParamsDictionary } from 'express-serve-static-core'
import {
  RegisterReqBody,
  LoginReqBody,
  LogoutReqBody,
  VerifyEmailReqBody,
  TokenPayload,
  UpdateProfileBody,
  followBody,
  unfollowParams
} from '~/models/requests/User.requests'
import { USER_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import followService from '~/services/follower.services'

export const loginController = async (req: Request<ParamsDictionary, any, LoginReqBody>, res: Response) => {
  const result = await userService.login(req.body)
  const status = result ? 200 : 401
  const message = result ? USER_MESSAGES.LOGIN_SUCCESS : USER_MESSAGES.LOGIN_FAILURE
  res.status(status).json({
    result,
    message
  })
}

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    result,
    message: USER_MESSAGES.REGISTER_SUCCESS
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
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  } else if (user && user.verify_email_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  const result = await userService.verifyEmail(user?._id.toString() || '')
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.VERIFY_EMAIL_SUCCESS,
    result
  })
}

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const [user] = await Promise.all([userService.checkExistedUser(user_id), userService.resendVerifyEmailToken(user_id)])
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  } else if (user && user.verify_email_token === '') {
    return res.status(HTTP_STATUS.OK).json({
      message: USER_MESSAGES.EMAIL_ALREADY_VERIFIED
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.RESEND_EMAIL_SUCCESS
  })
}

export const createForgotPasswordController = async (req: Request, res: Response) => {
  const user_id = req.user_id as string
  const result = await userService.createForgotPasswordToken(user_id)
  res.status(HTTP_STATUS.OK).json(result)
}

export const verifyForgotPasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { forgot_password_token } = req.body
  const user = await userService.checkExistedUser(user_id)
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  } else if (user.forgot_password_token !== forgot_password_token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID
    })
  }
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.FORGOT_PASSWORD_VALID
  })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_forgot_password_token as TokenPayload
  const { forgot_password_token, password } = req.body
  const user = await userService.checkExistedUser(user_id)
  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({
      message: USER_MESSAGES.USER_NOT_FOUND
    })
  } else if (user.forgot_password_token !== forgot_password_token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID
    })
  }
  const result = await userService.resetPassword(user_id, password)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.RESET_PASSWORD_SUCCESS,
    result
  })
}

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const user = await userService.getUser(user_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.GET_USER_SUCCESS,
    user
  })
}

export const updateMeController = async (req: Request<ParamsDictionary, any, UpdateProfileBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const body = req.body
  await userService.updateProfileUser(user_id, body)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.UPDATE_USER_SUCCESS
  })
}

export const getUserController = async (req: Request, res: Response) => {
  const { username } = req.params
  const user = await userService.getUserByUsername(username)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.USER_FOUND,
    user
  })
}

export const followController = async (req: Request<ParamsDictionary, any, followBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { following_user_id } = req.body as followBody
  await userService.followUser(user_id, following_user_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.FOLLOW_USER_SUCCESS
  })
}

export const unfollowController = async (req: Request<unfollowParams>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const { following_user_id } = req.params as unfollowParams
  await userService.unfollowUser(user_id, following_user_id)
  res.status(HTTP_STATUS.OK).json({
    message: USER_MESSAGES.UNFOLLOW_USER_SUCCESS
  })
}
