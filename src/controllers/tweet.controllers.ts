/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import tweetService, { TweetReqBody } from '~/services/tweet.services'

export const createTweetController = async (req: Request, res: Response) => {
  const tweet = req.body as TweetReqBody
  const user_id = new ObjectId(req.decoded_authorization?.user_id as string)
  const result = await tweetService.createTweet(tweet, user_id)
  res.status(HTTP_STATUS.OK).json({
    result,
    message: TWEET_MESSAGES.TWEET_SUCCESS
  })
}
