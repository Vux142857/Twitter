import { Router, Request, Response } from 'express'
import { loginController, logoutController } from '~/controllers/users.controllers'
import { registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'
databaseService
loginController
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
userRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.users.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default userRouter
