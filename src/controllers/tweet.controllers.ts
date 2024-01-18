/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ObjectId } from 'mongodb'
import { TWEET_MESSAGES } from '~/constants/messages'
import { TweetReqBody } from '~/models/requests/Tweet.requests'
import tweetService from '~/services/tweet.services'

export const createTweetController = async (req: Request, res: Response) => {
  const tweet = req.body as TweetReqBody
  const user_id = new ObjectId(req.decoded_authorization?.user_id as string)
  const result = await tweetService.createTweet(tweet, user_id)
  res.status(200).json({
    result,
    message: TWEET_MESSAGES.TWEET_SUCCESS
  })
}
