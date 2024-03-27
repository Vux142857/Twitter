import { checkSchema } from 'express-validator'
import HTTP_STATUS from '~/constants/httpStatus'
import { MESSAGE_RESPONSE, TWEET_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import { validate } from '~/utils/validation'

export const messageValidator = validate(
    checkSchema(
        {
            skip: {
                isNumeric: true,
                errorMessage: TWEET_MESSAGES.PAGINATION_SKIP_VALUE_INVALID,
                notEmpty: {
                    errorMessage: TWEET_MESSAGES.PAGINATION_SKIP_VALUE_REQUIRED
                }
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
            },
            conversation_id: {
                isString: {
                    errorMessage: MESSAGE_RESPONSE.CONVERSATION_ID_INVALID
                },
                notEmpty: {
                    errorMessage: MESSAGE_RESPONSE.CONVERSATION_ID_INVALID
                }
            }
        },
        ['query', 'params']
    )
)