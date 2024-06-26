/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import tweetService, { TweetReqBody } from '~/services/tweet.services'
import { ParamsDictionary } from 'express-serve-static-core'
import { TweetQuery } from '~/models/requests/Tweet.requests'
import redisService from '~/services/database/redis.services'
import { TweetType } from '~/constants/enum'

export const createTweetController = async (req: Request, res: Response) => {
  const tweet = req.body as TweetReqBody
  const user_id = new ObjectId(req.decoded_authorization?.user_id as string)
  const result = await tweetService.createTweet(tweet, user_id)
  if (result && result.type === TweetType.Comment) {
    const comment = await tweetService.getTweetById(new ObjectId(result._id))
    await redisService.cacheComments(
      comment?.parent_id?.toString() as string,
      comment
    )
  }
  res.status(HTTP_STATUS.OK).json({
    result,
    message: TWEET_MESSAGES.TWEET_SUCCESS
  })
}

export const getTweetByIdController = async (req: Request, res: Response) => {
  await tweetService.updateViewsTweet(
    new ObjectId(req.tweet?._id),
    new ObjectId(req.decoded_authorization?.user_id as string)
  )
  res.status(HTTP_STATUS.OK).json({
    result: req.tweet,
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS
  })
}

export const getTweetsChildrenController = async (
  req: Request<ParamsDictionary, any, any, TweetQuery>,
  res: Response
) => {
  const { skip, limit, type } = req.query
  let result
  const cachedTweetsChildren = (parseInt(type as string) === TweetType.Comment)
    ? await redisService.getCachedComments(
      req.tweet?._id?.toString() as string,
      parseInt(skip as string),
      parseInt(limit as string),
    )
    : await redisService.getCachedTweetsChildren(
      req.tweet?._id?.toString() as string,
      parseInt(skip as string),
      parseInt(limit as string),
    )
  if (cachedTweetsChildren.length > 0) {
    const total = await tweetService.countTweetsChildren(
      new ObjectId(req.tweet?._id),
      parseInt(type as string)
    )
    const totalPage = Math.ceil(total / parseInt(limit as string))
    result = { tweetsChildren: cachedTweetsChildren, total, totalPage, skip, limit }
  } else {
    const { tweetsChildren, total } = await tweetService.getTweetsChildren(
      new ObjectId(req.tweet?._id),
      new ObjectId(req.decoded_authorization?.user_id as string),
      parseInt(type as string),
      parseInt(skip as string),
      parseInt(limit as string)
    )
    if (Array.isArray(tweetsChildren)) {
      await Promise.all(
        tweetsChildren.map(async (element: any) => {
          await redisService.cacheTweetsChildren(
            req.tweet?._id?.toString() as string,
            parseInt(skip as string),
            parseInt(limit as string),
            element
          )
        })
      )
    }
    const totalPage = Math.ceil(total / parseInt(limit as string))
    result = { tweetsChildren, total, totalPage, skip, limit }
  }
  res.status(HTTP_STATUS.OK).json({
    result,
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESS
  })
}

export const getTweetsByUserController = async (
  req: Request<ParamsDictionary, any, any, TweetQuery>,
  res: Response
) => {
  const { skip, limit } = req.query
  const user_id = req.params.user_id
  const { tweetsByUser, total } = await tweetService.getTweetsByUser(
    new ObjectId(user_id),
    new ObjectId(req.decoded_authorization?.user_id as string),
    parseInt(skip as string),
    parseInt(limit as string)
  )
  const totalPage = Math.ceil(total / parseInt(limit as string))
  const result = { tweetsByUser, total, totalPage, skip, limit }
  res.status(HTTP_STATUS.OK).json({
    result,
    message: TWEET_MESSAGES.GET_TWEET_BY_USER
  })
}

export const getTweetByFollowed = async (req: Request<ParamsDictionary, any, any, TweetQuery>, res: Response) => {
  const { skip, limit } = req.query
  const { tweetsByFollowed, totalFollowedUser } = await tweetService.getTweetsByFollowed(
    new ObjectId(req.decoded_authorization?.user_id as string),
    parseInt(skip as string),
    parseInt(limit as string)
  )
  const isChildren = false
  const updatedTweetsByFollowed = await tweetService.updateViewsTweet(
    null,
    new ObjectId(req.decoded_authorization?.user_id as string),
    isChildren,
    tweetsByFollowed
  )
  res.status(HTTP_STATUS.OK).json({
    result: { tweetsByFollowed: updatedTweetsByFollowed, totalFollowedUser, skip, limit },
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS
  })
}

export const getTweetsByViews = async (req: Request<ParamsDictionary, any, any, TweetQuery>, res: Response) => {
  const { skip, limit } = req.query
  const tweetsByViews = await tweetService.getTweetsByViews(
    new ObjectId(req.decoded_authorization?.user_id as string),
    parseInt(skip as string),
    parseInt(limit as string)
  )
  const isChildren = false
  const updatedTweetsByViews = await tweetService.updateViewsTweet(
    null,
    new ObjectId(req.decoded_authorization?.user_id as string),
    isChildren,
    tweetsByViews
  )
  res.status(HTTP_STATUS.OK).json({
    result: { tweetsByViews: updatedTweetsByViews, skip, limit },
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS
  })
}

export const getTweetsByHashtag = async (req: Request<ParamsDictionary, any, any, TweetQuery>, res: Response) => {
  const { skip, limit } = req.query
  const name = req.params.name
  const { tweetsByHashtag, totalTweetsByHashtag } = await tweetService.getTweetsByHashtag(
    new ObjectId(req.decoded_authorization?.user_id as string),
    name,
    parseInt(skip as string),
    parseInt(limit as string)
  )
  const isChildren = false
  const updatedTweetsByHashtag = await tweetService.updateViewsTweet(
    null,
    new ObjectId(req.decoded_authorization?.user_id as string),
    isChildren,
    tweetsByHashtag
  )
  res.status(HTTP_STATUS.OK).json({
    result: { tweetsByHashtag: updatedTweetsByHashtag, totalTweetsByHashtag, skip, limit },
    message: TWEET_MESSAGES.GET_TWEET_SUCCESS
  })
}

export const deleteTweetController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const result = await tweetService.deleteTweet(new ObjectId(tweet_id))
  res.status(HTTP_STATUS.OK).json({
    result,
    message: TWEET_MESSAGES.DELETE_TWEET_SUCCESS
  })
}
