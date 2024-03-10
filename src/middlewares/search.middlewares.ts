import { checkSchema } from 'express-validator'
import { SearchFilterQuery } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { enumToStringArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const FilterTypesArray = enumToStringArray(SearchFilterQuery)
export const searchQueryValidator = validate(
  checkSchema(
    {
      filter: {
        isIn: {
          options: [FilterTypesArray],
          errorMessage: TWEET_MESSAGES.TWEET_TYPE_INVALID
        }
      },
      skip: {
        isNumeric: true,
        errorMessage: TWEET_MESSAGES.PAGINATION_SKIP_VALUE_INVALID
      },
      limit: {
        isNumeric: true,
        custom: {
          options: async (value: string) => {
            if (parseInt(value) < 0 || isNaN(parseInt(value)) || parseInt(value) > 10) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.PAGINATION_LIMIT_VALUE_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      }
    },
    ['query']
  )
)
