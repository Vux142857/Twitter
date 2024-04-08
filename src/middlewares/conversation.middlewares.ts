/* eslint-disable @typescript-eslint/no-explicit-any */
import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { CONVERSATION_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { validate } from '~/utils/validation'
import userService from '~/services/user.services'

export const conversationIdValidator = validate(
  checkSchema(
    {
      id: {
        isString: {
          errorMessage: CONVERSATION_MESSAGES.CONVERSATION_ID_INVALID
        },
        notEmpty: {
          errorMessage: CONVERSATION_MESSAGES.CONVERSATION_ID_REQUIRED
        },
      }
    },
    ['params']
  )
)

export const createConversationValidator = validate(
  checkSchema(
    {
      receiver: {
        notEmpty: {
          errorMessage: CONVERSATION_MESSAGES.CONVERSATION_RECEIVER_REQUIRED
        },
        isString: {
          errorMessage: CONVERSATION_MESSAGES.CONVERSATION_RECEIVER_INVALID
        },
        custom: {
          options: async (value: string, { req }) => {
            const existedUser = await userService.getUser(value)
            if (!existedUser) {
              throw new ErrorWithStatus({
                message: USER_MESSAGES.USER_NOT_FOUND,
                status: HTTP_STATUS.BAD_REQUEST
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