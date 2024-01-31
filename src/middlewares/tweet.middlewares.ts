import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { TweetAudience, TweetType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import Media from '~/models/schemas/Media.schema'
import tweetService from '~/services/tweet.services'
import { enumToNumArray } from '~/utils/common'
import { validate } from '~/utils/validation'

const TweetTypesArray = enumToNumArray(TweetType)
const TweetAudienceArray = enumToNumArray(TweetAudience)
export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [TweetTypesArray]
        },
        errorMessage: TWEET_MESSAGES.TWEET_TYPE_INVALID
      },
      audience: {
        isIn: {
          options: [TweetAudienceArray]
        },
        errorMessage: TWEET_MESSAGES.TWEET_AUDIENCE_INVALID
      },
      content: {
        isString: true,
        isLength: {
          options: {
            max: 1000
          }
        },
        custom: {
          options: async (value: string, { req }) => {
            try {
              const { type } = req.body
              if (type == TweetType.Retweet && value !== '') {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.RETWEET_CONTENT_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
              if (type != TweetType.Retweet && value === '') {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.TWEET_CONTENT_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
            } catch (error) {
              if (error) {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.TWEET_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
            }
            return true
          }
        }
      },
      hashtag: {
        isArray: true,
        custom: {
          options: async (value: string[]) => {
            if (value.some((item) => !(typeof item === 'string'))) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.HASHTAG_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      mention: {
        isArray: true,
        custom: {
          options: async (value: string[]) => {
            if (value.some((item) => !(typeof item === 'string'))) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.MENTION_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      media: {
        isArray: true,
        custom: {
          options: async (value: Media[]) => {
            if (value.some((item) => !(item instanceof Media))) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.MEDIA_INVALID,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        }
      },
      parent_id: {
        custom: {
          options: async (value: string, { req }) => {
            try {
              const { type } = req.body
              if (type != TweetType.Tweet && !ObjectId.isValid(value)) {
                console.log(123)
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.RETWEET_WITHOUT_PARENT,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              } else if (type == TweetType.Tweet && ObjectId.isValid(value)) {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.TWEET_PARENT_MUST_BE_NULL,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              } else if (type != TweetType.Tweet && ObjectId.isValid(value)) {
                const parentTweet = await tweetService.getTweetById(new ObjectId(value))
                if (!parentTweet) {
                  throw new ErrorWithStatus({
                    message: TWEET_MESSAGES.PARENT_TWEET_NOT_FOUND,
                    status: HTTP_STATUS.BAD_REQUEST
                  })
                }
              }
            } catch (error) {
              console.log(error)
              if (error) {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.RETWEET_FAILED,
                  status: HTTP_STATUS.BAD_REQUEST
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

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: {
          errorMessage: TWEET_MESSAGES.TWEET_ID_IS_REQUIRED
        },
        custom: {
          options: async (value: string) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.TWEET_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            if (!(await tweetService.getTweetById(new ObjectId(value)))) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.TWEET_NOT_FOUND,
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

// export const tweetIdAndUserIdValidator = validate()
