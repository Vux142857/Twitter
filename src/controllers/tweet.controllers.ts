/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { TweetType } from '~/constants/enum'
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

export const getTweetByIdController = async (req: Request, res: Response) => {
  await tweetService.updateViewsTweet(req.tweet?._id as ObjectId, req.decoded_authorization?.user_id)
  res.status(HTTP_STATUS.OK).json({
    result: req.tweet,
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS
  })
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const { skip, limit, type } = req.query
  const { tweetChildren, total } = await tweetService.getTweetChildren(
    req.tweet?._id as ObjectId,
    req.decoded_authorization?.user_id as string,
    parseInt(type as string),
    parseInt(skip as string),
    parseInt(limit as string)
  )
  const totalPage = Math.ceil(total / parseInt(limit as string))
  res.status(HTTP_STATUS.OK).json({
    result: { tweetChildren, total, totalPage, skip, limit },
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESS
  })
}
