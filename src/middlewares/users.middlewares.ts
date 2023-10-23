import { ParamSchema, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import userService from '~/services/users.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'
import { verifyToken } from '~/utils/jwt'
import tokenService from '~/services/tokens.services'
import { JsonWebTokenError } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus } from '~/constants/enum'

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
        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string
        })
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
                status: HTTP_STATUS.UNAUTHORIZED
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
              const decoded_access_token = await verifyToken({
                token: accessToken,
                secretKey: process.env.JWT_SECRET_ACCESS_TOKEN as string
              })
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
              const decoded_refresh_token = await verifyToken({
                token: existedToken,
                secretKey: process.env.JWT_SECRET_REFRESH_TOKEN as string
              })
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
              const decoded_verify_email_token = await verifyToken({
                token: value,
                secretKey: process.env.JWT_SECRET_VERIFY_EMAIL_TOKEN as string
              })
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
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.INVALID_USERNAME_FORMAT
        },
        trim: true,
        isLength: {
          options: {
            min: 3,
            max: 20
          },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH
        }
      },
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
