/* eslint-disable @typescript-eslint/no-explicit-any */
import { ParamSchema, checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import userService from '~/services/user.services'
import { ErrorWithStatus } from '~/models/Error'
import HTTP_STATUS from '~/constants/httpStatus'
import { USER_MESSAGES } from '~/constants/messages'
import tokenService from '~/services/token.services'
import { JsonWebTokenError } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { TokenPayload } from '~/models/requests/User.requests'
import { UserVerifyStatus, FollowFilterQuery } from '~/constants/enum'
import followService from '~/services/follower.services'
import { enumToStringArray } from '~/utils/common'

const filterFollowerList = enumToStringArray(FollowFilterQuery)
const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.INVALID_PASSWORD_FORMAT
  },
  isLength: {
    options: { min: 8 },
    errorMessage: USER_MESSAGES.PASSWORD_TOO_SHORT
  },
  isStrongPassword: {
    options: {
      minLowercase: 1,
      minNumbers: 1,
      minUppercase: 1,
      minSymbols: 1
    },
    errorMessage: USER_MESSAGES.PASSWORD_TOO_WEAK
  }
}

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USER_MESSAGES.PASSWORDS_DO_NOT_MATCH)
      }
      return true
    }
  }
}

const forgotPasswordTokenSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
  },
  isString: {
    errorMessage: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID
  },
  custom: {
    options: async (value: string, { req }) => {
      try {
        const decoded_forgot_password_token = await tokenService.decodeForgotPasswordToken(value)
        req.decoded_forgot_password_token = decoded_forgot_password_token
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.FORGOT_PASSWORD_TOKEN_INVALID,
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
    errorMessage: USER_MESSAGES.NAME_IS_REQUIRED
  },
  trim: true,
  isLength: {
    options: {
      min: 1,
      max: 100
    }
  },
  errorMessage: USER_MESSAGES.INVALID_NAME_FORMAT
}

const dateOfBirthSchema: ParamSchema = {
  notEmpty: true,
  isISO8601: {
    options: {
      strict: true,
      strictSeparator: true
    }
  },
  errorMessage: USER_MESSAGES.INVALID_DATE_OF_BIRTH_FORMAT
}

const imageSchema: ParamSchema = {
  optional: true,
  trim: true,
  custom: {
    options: (value) => {
      if (value) {
        if (!isValidWebsiteUrl(value)) {
          throw new ErrorWithStatus({
            message: USER_MESSAGES.INVALID_IMG_URL_FORMAT,
            status: HTTP_STATUS.BAD_REQUEST
          })
        }
        if (value) {
          if (value.length > 400 || value.length < 3) {
            throw new ErrorWithStatus({
              message: USER_MESSAGES.IMG_URL_LENGTH,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
        }
      }
      return true
    }
  }
}

const usernameSchema: ParamSchema = {
  trim: true,
  isString: {
    errorMessage: USER_MESSAGES.INVALID_USERNAME_FORMAT
  },
  matches: {
    options: /^[a-zA-Z0-9_]{3,20}$/,
    errorMessage: USER_MESSAGES.INVALID_USERNAME_FORMAT
  },
  isLength: {
    options: {
      min: 3,
      max: 20
    },
    errorMessage: USER_MESSAGES.USERNAME_LENGTH
  },
  custom: {
    options: async (value) => {
      const existedUser = await userService.checkExistedUsername(value)
      if (existedUser) {
        throw new ErrorWithStatus({
          message: USER_MESSAGES.USERNAME_ALREADY_EXISTS,
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
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: {
          errorMessage: USER_MESSAGES.INVALID_EMAIL_FORMAT
        }
      },
      password: {
        notEmpty: {
          errorMessage: USER_MESSAGES.PASSWORD_IS_REQUIRED
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
          errorMessage: USER_MESSAGES.USERNAME_IS_REQUIRED
        },
        ...usernameSchema
      },
      email: {
        notEmpty: {
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: true,
        errorMessage: USER_MESSAGES.INVALID_EMAIL_FORMAT,
        custom: {
          options: async (value) => {
            const existedEmail = await userService.checkExistedEmail(value)
            if (existedEmail) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.EMAIL_ALREADY_EXISTS,
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
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.ACCESS_TOKEN_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const accessToken = value.split(' ')[1]
              if (accessToken === '') {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.ACCESS_TOKEN_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                })
              }
              const decoded_access_token = await tokenService.decodeAccessToken(accessToken)
              req.decoded_authorization = decoded_access_token
            } catch (error) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.ACCESS_TOKEN_EXPIRED,
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
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.REFRESH_TOKEN_INVALID
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
                message: USER_MESSAGES.REFRESH_TOKEN_EXPIRED,
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
          errorMessage: USER_MESSAGES.VERIFY_EMAIL_TOKEN_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.VERIFY_EMAIL_TOKEN_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const decoded_verify_email_token = await tokenService.decodeVerifyEmailToken(value)
              req.decoded_verify_email_token = decoded_verify_email_token
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.VERIFY_EMAIL_TOKEN_INVALID,
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
          errorMessage: USER_MESSAGES.EMAIL_IS_REQUIRED
        },
        trim: true,
        isEmail: true,
        errorMessage: USER_MESSAGES.INVALID_EMAIL_FORMAT,
        custom: {
          options: async (value, { req }) => {
            const user = await userService.checkExistedEmail(value)
            if (!user) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
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
    next(new ErrorWithStatus({ message: USER_MESSAGES.USER_NOT_VERIFIED, status: HTTP_STATUS.FORBIDDEN }))
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
        notEmpty: false,
        optional: true,
        custom: {
          options: async (value) => {
            if (typeof value !== 'string') {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.INVALID_BIO_FORMAT,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (value.length > 255) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.BIO_TOO_LONG,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      location: {
        notEmpty: false,
        isString: {
          errorMessage: USER_MESSAGES.INVALID_BIO_FORMAT
        },
        isLength: {
          options: {
            max: 200
          },
          errorMessage: USER_MESSAGES.LOCATION_TOO_LONG
        },
      },
      username: {
        optional: true,
        trim: true,
        isString: {
          errorMessage: USER_MESSAGES.INVALID_USERNAME_FORMAT
        },
        matches: {
          options: /^[a-zA-Z0-9_]{3,20}$/,
          errorMessage: USER_MESSAGES.INVALID_USERNAME_FORMAT
        },
        isLength: {
          options: {
            min: 3,
            max: 20
          },
          errorMessage: USER_MESSAGES.USERNAME_LENGTH
        }
      },
      avatar: imageSchema,
      cover_photo: imageSchema,
      website: {
        optional: true,
        trim: true,
        custom: {
          options: (value) => {
            if (value) {
              if (!isValidWebsiteUrl(value)) {
                throw new ErrorWithStatus({
                  message: USER_MESSAGES.INVALID_WEBSITE_URL_FORMAT,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
              if (value) {
                if (value.length > 400 || value.length < 3) {
                  throw new ErrorWithStatus({
                    message: USER_MESSAGES.WEBSITE_URL_LENGTH,
                    status: HTTP_STATUS.BAD_REQUEST
                  })
                }
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

export const followValidator = validate(
  checkSchema(
    {
      following_user_id: {
        notEmpty: {
          errorMessage: USER_MESSAGES.FOLLOWING_USER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.INVALID_FOLLOWING_USER_ID_FORMAT
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
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (existedfollow) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_ALREADY_FOLLOWED,
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
          errorMessage: USER_MESSAGES.FOLLOWING_USER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.INVALID_FOLLOWING_USER_ID_FORMAT
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
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            if (!existedfollow) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_ALREADY_UNFOLLOWED,
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

// req.header: user gửi j nhận cái đấy, k phân biệt chữ hoa vs chữ thường
// req.headers: của express, phân biệt chữ hoa vs chữ thường (map authorization vs Authorization)
export const isUserLoggedInValidator = (middleware: (req: Request, res: Response, next: NextFunction) => void) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.headers.authorization) {
        return middleware(req, res, next)
      }
      next()
    } catch (error) {
      console.log(error)
    }
  }
}

export const queryFollowListValidator = validate(
  checkSchema(
    {
      user_id: {
        notEmpty: {
          errorMessage: USER_MESSAGES.FOLLOWING_USER_ID_IS_REQUIRED
        },
        isString: {
          errorMessage: USER_MESSAGES.INVALID_FOLLOWING_USER_ID_FORMAT
        },
        custom: {
          options: async (value) => {
            const existedUser = await userService.checkExistedUser(value)
            if (!existedUser) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
              })
            }
            return true
          }
        }
      },
      type: {
        isIn: {
          options: [filterFollowerList],
          errorMessage: USER_MESSAGES.FILTER_FOLLOW_LIST_INVALID
        }
      },
      skip: {
        isNumeric: true,
        errorMessage: USER_MESSAGES.PAGINATION_SKIP_VALUE_INVALID
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async (value: string) => {
            if (parseInt(value) < 0 || isNaN(parseInt(value)) || parseInt(value) > 10) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.PAGINATION_LIMIT_VALUE_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['params', 'query']
  )
)

// Utils
function isValidWebsiteUrl(url: string) {
  if (!url) {
    return true; // Allow empty string
  }
  // Regular expression for a valid URL format
  const urlRegex = /^(https?:\/\/)?([^\s:@]+)(:\d+)?(\/[^\s]*)?$/i;

  // Check if the URL matches the regex pattern
  if (!urlRegex.test(url)) {
    return false; // Invalid format
  }

  // Check if the URL length is within the allowed range
  if (url.length < 3 || url.length > 400) {
    return false; // URL length outside allowed range
  }

  return true; // Valid website URL
}
