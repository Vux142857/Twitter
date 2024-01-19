import { checkSchema } from 'express-validator'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import { validate } from '~/utils/validation'

export const createBookmarkValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isString: {
          errorMessage: BOOKMARK_MESSAGES.TWEET_ID_TYPE_INVALID
        },
        notEmpty: {
          errorMessage: BOOKMARK_MESSAGES.TWEET_ID_IS_REQUIRED
        }
      }
    },
    ['body']
  )
)
