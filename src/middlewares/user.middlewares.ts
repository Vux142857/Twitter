import { ParamSchema, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import userService from '~/services/user.services'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'
import tokenService from '~/services/token.services'
import { JsonWebTokenError } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enum'
import followService from '~/services/follower.services'

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.INVALID_PASSWORD_FORMAT
  },
  isLength: {
    options: { min: 8 },
    errorMessage: USERS_MESSAGES.PASSWORD_TOO_SHORT
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1
    },
    errorMessage: USERS_MESSAGES.PASSWORD_TOO_WEAK
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_EMAIL_IS_REQUIRED
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID
  },
  custom: {
    options: async (value: string, { req }) => {
      try {
        const decoded_forgot_password_token = await tokenService.decodeForgotPasswordToken(value)
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
            status: HTTP_STATUS.UNAUTHORIZED
          })
        }
      }
      return true
    }
  }
}

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    }
  },
  errorMessage: USERS_MESSAGES.INVALID_NAME_FORMAT
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: true,
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: USERS_MESSAGES.INVALID_DATE_OF_BIRTH_FORMAT
}

const imageSchema: ParamSchema = {
  optional: true,
  trim: true,
  isURL: {
    errorMessage: USERS_MESSAGES.INVALID_AVATAR_FORMAT
  },
  isLength: {
    options: {
      min: 3,
      max: 400
    }
  }
}

const usernameSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: USERS_MESSAGES.INVALID_USERNAME_FORMAT
  },
  matches: {
    options: /^[a-zA-Z0-9_]{3,20}$/,
    errorMessage: USERS_MESSAGES.INVALID_USERNAME_FORMAT
  },
  isLength: {
    options: {
      min: 3,
      max: 20
    },
    errorMessage: USERS_MESSAGES.USERNAME_LENGTH
  },
  custom: {
    options: async (value) => {
      const existedUser = await userService.checkExistedUsername(value)
      if (existedUser) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS,
          status: HTTP_STATUS.CONFLICT
        })
      }
      return true
    }
  }
}

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: USERS_MESSAGES.INVALID_EMAIL_FORMAT
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      username: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USERNAME_IS_REQUIRED
        },
        ...usernameSchema
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: true,
        errorMessage: USERS_MESSAGES.INVALID_EMAIL_FORMAT,
        custom: {
          options: async (value) => {
            const existedEmail = await userService.checkExistedEmail(value)
            if (existedEmail) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      },
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const accessToken = value.split(' ')[1]
              if (accessToken === '') {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              const decoded_access_token = await tokenService.decodeAccessToken(accessToken)
              req.decoded_authorization = decoded_access_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const refreshToken = await tokenService.checkExistedRefreshToken(value)
              const existedToken = refreshToken ? refreshToken.token : ''
              const decoded_refresh_token = await tokenService.decodeRefreshToken(existedToken)
              req.decoded_refresh_token = decoded_refresh_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_INVALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailTokenValidator = validate(
  checkSchema(
    {
      verify_email_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.VERIFY_EMAIL_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.VERIFY_EMAIL_TOKEN_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_verify_email_token = await tokenService.decodeVerifyEmailToken(value)
              req.decoded_verify_email_token = decoded_verify_email_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.VERIFY_EMAIL_TOKEN_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordEmailValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: true,
        errorMessage: USERS_MESSAGES.INVALID_EMAIL_FORMAT,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.checkExistedEmail(value)
            if (!user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            } else {
              const user_id = user._id.toString()
              req.user_id = user_id
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema({
    password: passwordSchema,
    confirm_password: confirmPasswordSchema,
    forgot_password_token: forgotPasswordTokenSchema
  })
)

export const verifedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload
  if (verify !== UserVerifyStatus.Verified) {
    next(new ErrorWithStatus({ message: USERS_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.FORBIDDEN }))
  }
  next()
}

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        ...nameSchema,
        notEmpty: false,
        optional: true
      },
      date_of_birth: {
        ...dateOfBirthSchema,
        optional: true
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.INVALID_BIO_FORMAT
        },
        isLength: {
          options: {
            min: 1,
            max: 255
          },
          errorMessage: USERS_MESSAGES.BIO_TOO_LONG
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.INVALID_BIO_FORMAT
        },
        isLength: {
          options: {
            max: 200
          },
          errorMessage: USERS_MESSAGES.LOCATION_TOO_LONG
        }
      },
      username: { ...usernameSchema, optional: true },
      avatar: imageSchema,
      cover_photo: imageSchema,
      website: {
        optional: true,
        isURL: {
          errorMessage: USERS_MESSAGES.INVALID_WEBSITE_URL_FORMAT
        },
        trim: true,
        isLength: {
          options: {
            min: 3,
            max: 400
          },
          errorMessage: USERS_MESSAGES.WEBSITE_URL_LENGTH
        }
      }
    },
    ['body']
  )
)

export const followValidator = validate(
  checkSchema(
    {
      following_user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.FOLLOWING_USER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.INVALID_FOLLOWING_USER_ID_FORMAT
        },
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const [existedUser, existedfollow] = await Promise.all([
              userService.checkExistedUser(value),
              followService.findFollow(user_id, value)
            ])
            if (!existedUser) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (existedfollow) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_ALREADY_FOLLOWED,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const unfollowValidator = validate(
  checkSchema(
    {
      following_user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.FOLLOWING_USER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.INVALID_FOLLOWING_USER_ID_FORMAT
        },
        custom: {
          options: async (value, { req }) => {
            const { user_id } = req.decoded_authorization as TokenPayload
            const [existedUser, existedfollow] = await Promise.all([
              userService.checkExistedUser(value),
              followService.findFollow(user_id, value)
            ])
            if (!existedUser) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (!existedfollow) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USER_ALREADY_UNFOLLOWED,
                status: HTTP_STATUS.CONFLICT
              })
            }
            return true
          }
        }
      }
    },
    ['params']
  )
)
