import { NextFunction, Request, Response } from 'express'
import { checkSchema } from 'express-validator'
import { validate } from '~/utils/validation'
import userService from '~/services/users.services'
import ErrorWithStatus from '~/models/Errors'

export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).json({
      error: 'Missing email or password'
    })
  }
  next()
}

export const registerValidator = validate(
  checkSchema({
    name: {
      notEmpty: true,
      trim: true,
      isLength: {
        options: {
          min: 1,
          max: 100
        }
      },
      errorMessage: 'Invalid name'
    },
    email: {
      notEmpty: true,
      trim: true,
      isEmail: true,
      errorMessage: 'Invalid email',
      custom: {
        options: async (value) => {
          const existedEmail = await userService.checkExistedEmail(value)
          if (existedEmail) {
            throw new ErrorWithStatus({ message: 'Email already used !', status: 401 })
          }
          return true
        }
      }
    },
    password: {
      isLength: {
        options: { min: 8 },
        errorMessage: 'Password should be at least 8 chars'
      },
      isStrongPassword: {
        options: {
          minLowercase: 1,
          minNumbers: 1,
          minUppercase: 1,
          minSymbols: 1
        },
        errorMessage: 'Weak password'
      }
    },
    confirm_password: {
      custom: {
        options: (value, { req }) => {
          if (value !== req.body.password) {
            throw new Error('Password not match !')
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
      errorMessage: 'Invalid date of birth'
    }
  })
)
