/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import tweetService from '~/services/tweet.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { SearchQuery } from '~/models/requests/Tweet.requests'
import { SearchFilterQuery } from '~/constants/enum'

export const searchTweets = async (req: Request<ParamsDictionary, any, any, SearchQuery>, res: Response) => {
  const { skip, limit, filter, value } = req.query
  let result = {}
  if (filter !== SearchFilterQuery.User) {
    const tweets = await tweetService.searchTweets(
      req.decoded_authorization?.user_id as string,
      value as string,
      filter as string,
      parseInt(skip as string),
      parseInt(limit as string)
    )
    result = { tweets, skip, limit }
  }
  res.status(HTTP_STATUS.OK).json({
    result,
    message: TWEET_MESSAGES.SEARCH_TWEETS_SUCCESS
  })
}
