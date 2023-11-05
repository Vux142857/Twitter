import { Router, Request, Response } from 'express'
import {
  createForgotPasswordController,
  followController,
  getMeController,
  getUserController,
  loginController,
  logoutController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController
} from '~/controllers/user.controllers'
import { registerController } from '~/controllers/user.controllers'
import { filterMiddleware } from '~/middlewares/common.middlewares'
import {
  accessTokenValidator,
  forgotPasswordTokenValidator,
  forgotPasswordEmailValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator,
  resetPasswordValidator,
  verifedUserValidator,
  updateMeValidator,
  followValidator,
  unfollowValidator
} from '~/middlewares/user.middlewares'
import { UpdateProfileBody } from '~/models/requests/User.requests'
import databaseService from '~/services/database/database.services' // test clear database
import { wrapAsync } from '~/utils/handler'
const userRouter = Router()

userRouter.get(
  '/',
  wrapAsync((req: Request, res: Response) => {
    res.send('Hello World!')
  })
)
userRouter.post('/login', loginValidator, wrapAsync(loginController))
userRouter.post('/register', registerValidator, wrapAsync(registerController))
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))
userRouter.post('/verify-email', verifyEmailTokenValidator, wrapAsync(verifyEmailController))
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))
userRouter.post('/create-forgot-password', forgotPasswordEmailValidator, wrapAsync(createForgotPasswordController))
userRouter.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordController))
userRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordController))
userRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateProfileBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'username',
    'avatar',
    'cover_photo',
    'website'
  ]),
  wrapAsync(updateMeController)
)
userRouter.get('/:username', wrapAsync(getUserController))
userRouter.post('/follow', accessTokenValidator, followValidator, verifedUserValidator, wrapAsync(followController))
userRouter.delete(
  '/follow/:following_user_id',
  accessTokenValidator,
  unfollowValidator,
  verifedUserValidator,
  wrapAsync(unfollowController)
)
// test clear database
userRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.users.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

userRouter.post(
  '/refresh-token/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.refreshTokens.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default userRouter
