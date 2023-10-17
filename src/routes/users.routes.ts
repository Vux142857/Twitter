import { Router, Request, Response } from 'express'
import {
  createForgotPasswordController,
  loginController,
  logoutController,
  resendVerifyEmailController,
  verifyEmailController
} from '~/controllers/users.controllers'
import { registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailTokenValidator
} from '~/middlewares/users.middlewares'
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
userRouter.post('/create-forgot-password', forgotPasswordValidator, wrapAsync(createForgotPasswordController))
userRouter.post('/verify-forgot-password', forgotPasswordValidator, wrapAsync(createForgotPasswordController))

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
