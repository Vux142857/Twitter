import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import userService from '~/services/users.services'
import { ErrorWithStatus } from '~/models/Errors'
import HTTP_STATUS from '~/constants/httpStatus'
import USERS_MESSAGES from '~/constants/messages'

export const loginValidator = validate(
  checkSchema({
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
  })
)

export const registerValidator = validate(
  checkSchema({
    name: {
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
              status: HTTP_STATUS.UNAUTHORIZED
            })
          }
          return true
        }
      }
    },
    password: {
      notEmpty: {
        errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
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
    },
    confirm_password: {
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
    },
    date_of_birth: {
      notEmpty: true,
      isISO8601: {
        options: {
          strict: true,
          strictSeparator: true
        }
      },
      errorMessage: USERS_MESSAGES.INVALID_DATE_OF_BIRTH_FORMAT
    }
  })
)
