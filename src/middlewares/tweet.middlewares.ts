/* eslint-disable @typescript-eslint/no-explicit-any */
import { checkSchema } from 'express-validator'
import { ObjectId } from 'mongodb'
import { MediaType, StatusType, TweetAudience, TweetType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES, USER_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'
import tweetService from '~/services/tweet.services'
import { enumToNumArray } from '~/utils/common'
import { validate } from '~/utils/validation'
import { NextFunction, Request, Response } from 'express'
import hashtagService from '~/services/hashtag.services'
import redisService from '~/services/database/redis.services'
import userService from '~/services/user.services'

const TweetTypesArray = enumToNumArray(TweetType)
const TweetAudienceArray = enumToNumArray(TweetAudience)
const MediaArray = enumToNumArray(MediaType)
const MediaStatusArray = enumToNumArray(StatusType)

interface MediaTypeRequest {
  type: number
  url: string
  status: number
}

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
              if (type === TweetType.Retweet && value !== '') {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.RETWEET_CONTENT_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              } else if (type !== TweetType.Retweet && value === '') {
                throw new ErrorWithStatus({
                  message: TWEET_MESSAGES.TWEET_CONTENT_INVALID,
                  status: HTTP_STATUS.BAD_REQUEST
                })
              }
            } catch (error: any) {
              if (error) {
                throw new ErrorWithStatus({
                  message: error.message,
                  status: error.status
                })
              }
            }
            return true
          }
        }
      },
      hashtag: {
        isArray: {
          options: {
            min: 0,
            max: 10
          },
          errorMessage: TWEET_MESSAGES.HASHTAG_MAX_LENGTH
        },
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
        isArray: {
          options: {
            min: 0,
            max: 10
          },
          errorMessage: TWEET_MESSAGES.MENTION_MAX_LENGTH
        },
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
        isArray: {
          options: {
            min: 0,
            max: 4
          },
          errorMessage: TWEET_MESSAGES.MEDIA_MAX_LENGTH
        },
        custom: {
          options: async (value: MediaTypeRequest[]) => {
            if (
              value.some((item) => item.url == '') ||
              value.some((item) => !MediaArray.includes(item.type)) ||
              value.some((item) => !MediaStatusArray.includes(item.status))
            ) {
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
      },
      tweet_circle: {
        isArray: {
          options: {
            min: 0,
            max: 20
          },
          errorMessage: TWEET_MESSAGES.TWEET_CIRCLE_MAX_LENGTH
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
          options: async (value: string, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.TWEET_ID_IS_REQUIRED,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            const cachedTweet = await redisService.getCachedTweetById(value)
            if (cachedTweet) {
              req.tweet = JSON.parse(cachedTweet)
              return true
            }
            const tweet = await tweetService.getTweetById(new ObjectId(value))
            if (!tweet) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.TWEET_NOT_FOUND,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            req.tweet = tweet
            await redisService.cacheTweetById(value, tweet)
            return true
          }
        }
      }
    },
    ['params']
  )
)

export const audienceValidator = (request: Request, response: Response, next: NextFunction) => {
  const tweet = request.tweet
  const guest = request.decoded_authorization?.user_id
  if (tweet && tweet.audience === TweetAudience.TweetCircle) {
    if ((guest && tweet.tweet_circle?.includes(new ObjectId(guest))) || tweet.user_id.equals(new ObjectId(guest))) {
      return next()
    }
    throw new ErrorWithStatus({
      message: TWEET_MESSAGES.TWEET_NOT_FOUND,
      status: HTTP_STATUS.NOT_FOUND
    })
  }
  next()
}

export const tweetsByUserValidator = validate(
  checkSchema(
    {
      user_id: {
        isString: {
          errorMessage: TWEET_MESSAGES.USER_ID_INVALID
        },
        notEmpty: {
          errorMessage: TWEET_MESSAGES.USER_ID_IS_REQUIRED
        },
        custom: {
          options: async (value: string) => {
            const user = await userService.getUser(value)
            if (!user) {
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

export const tweetQueryValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [TweetTypesArray],
          errorMessage: TWEET_MESSAGES.TWEET_TYPE_INVALID
        }
      },
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
      }
    },
    ['query']
  )
)

export const hashtagValidator = validate(
  checkSchema(
    {
      name: {
        isString: {
          errorMessage: TWEET_MESSAGES.HASHTAG_INVALID
        },
        notEmpty: {
          errorMessage: TWEET_MESSAGES.HASHTAG_IS_REQUIRED
        },
        custom: {
          options: async (value: string) => {
            const hashtag = await hashtagService.getHashtagByName(value)
            if (!hashtag) {
              throw new ErrorWithStatus({
                message: TWEET_MESSAGES.HASHTAG_NOT_FOUND,
                status: HTTP_STATUS.NOT_FOUND
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
