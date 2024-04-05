import { Router, Request, Response } from 'express'
import {
  createForgotPasswordController,
  followController,
  getFollow,
  getFollowList,
  getMeController,
  getUserController,
  loginController,
  logoutController,
  refreshTokenController,
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
  unfollowValidator,
  queryFollowListValidator
} from '~/middlewares/user.middlewares'
import { UpdateProfileBody } from '~/models/requests/User.requests'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'
const userRouter = Router()

// *********************** GET ***********************
// WIP: 90% - 100%
// Desciption: Get me
// Route: /api/user/me
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {result: {user}, message}
userRouter.get('/me', accessTokenValidator, wrapAsync(getMeController))

// WIP: 90% - 100%
// Desciption: Get user
// Route: /api/user/:username
// Method: GET
// Response OK: {user: {name, date_of_birth, bio, location, username, avatar, cover_photo, website}, message}
userRouter.get('/:username', wrapAsync(getUserController))

// WIP: 90% - 100%
// Desciption: Get follow
// Route: /api/user/follow/:username
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {result: {follow: Follow}, message}
userRouter.get('/follow/:following_user_id', accessTokenValidator, wrapAsync(getFollow))

// WIP: 90% - 100%
// Desciption: Get following
// Route: /api/user/follows/:user_id
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {result: {follow: Follow}, message}
userRouter.get('/follows/:user_id', queryFollowListValidator, wrapAsync(getFollowList))

// WIP: 90% - 100%
// Desciption: Update me
// Route: /api/user/me
// Method: PATCH
// Header: {Authorization: Bearer <accessToken> }
// Body: {name, date_of_birth, bio, location, username, avatar, cover_photo, website}
// Response OK: {message}
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

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Login
// Route: /api/user/login
// Method: POST
// Body: {email, password}
// Response OK: {result: {accessToken, refreshToken}, message}
userRouter.post('/login', loginValidator, wrapAsync(loginController))

// WIP: 90% - 100%
// Desciption: Register
// Route: /api/user/register
// Method: POST
// Body: {name, username, email, password, confirm_password, date_of_birth}
// Response OK: {result: {accessToken, refreshToken, verifyEmailToken}, message}
userRouter.post('/register', registerValidator, wrapAsync(registerController))

// WIP: 90% - 100%
// Desciption: Logout
// Route: /api/user/logout
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Body: {refreshToken}
// Response OK: {result: {message}}
userRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapAsync(logoutController))

// WIP: 90% - 100%
// Desciption: Verify email
// Route: /api/user/verify-email
// Header: {Authorization: Bearer <accessToken> }
// Method: POST
// Body: {verify_email_token}
// Response OK: {result: {accessToken, refreshToken}, message}
userRouter.post('/verify-email', accessTokenValidator, verifyEmailTokenValidator, wrapAsync(verifyEmailController))

// WIP: 90% - 100%
// Desciption: Resend verify email
// Route: /api/user/resend-verify-email
// Header: {Authorization: Bearer <accessToken> }
// Method: POST
// Response OK: {result: {verifyEmailToken}, message}
userRouter.post('/resend-verify-email', accessTokenValidator, wrapAsync(resendVerifyEmailController))

// WIP: 90% - 100%
// Desciption: Create forgot password
// Route: /api/user/create-forgot-password
// Method: POST
// Body: {email}
// Response OK: {message}
userRouter.post('/create-forgot-password', forgotPasswordEmailValidator, wrapAsync(createForgotPasswordController))

// WIP: 90% - 100%
// Desciption: Verify forgot password
// Route: /api/user/verify-forgot-password
// Method: POST
// Body: {forgot_password_token}
// Response OK: {message}
userRouter.post('/verify-forgot-password', forgotPasswordTokenValidator, wrapAsync(verifyForgotPasswordController))

// WIP: 90% - 100%
// Desciption: Reset password
// Route: /api/user/reset-password
// Method: POST
// Body: {password, confirm_password, forgot_password_token}
// Response OK: {result: {accessToken, refreshToken} ,message}
userRouter.post('/reset-password', resetPasswordValidator, wrapAsync(resetPasswordController))

// WIP: 90% - 100%
// Desciption: Follow verified user
// Route: /api/user/follow
// Method: POST
// Body: {following_user_id}
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {message}
userRouter.post('/follow', accessTokenValidator, followValidator, verifedUserValidator, wrapAsync(followController))

// WIP: 80% - 90%
// Desciption: Verify RT then create new AT
// Route: /api/user/refresh-token
// Method: POST
// Body: {refreshToken}
// Response OK: {result: {accessToken, refreshToken}, message}
userRouter.post('/refresh-token', refreshTokenValidator, wrapAsync(refreshTokenController))

// *********************** DELETE ***********************

// WIP: 90% - 100%
// Desciption: Unfollow verified user
// Route: /api/user/unfollow/:following_user_id
// Method: DELETE
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {message}
userRouter.delete(
  '/unfollow/:following_user_id',
  accessTokenValidator,
  unfollowValidator,
  verifedUserValidator,
  wrapAsync(unfollowController)
)

// *********************** FOR TESTING ONLY ***********************
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
