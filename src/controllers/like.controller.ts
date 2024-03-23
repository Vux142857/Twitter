/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'
import { LIKE_MESSAGES } from '~/constants/messages'
import likeService from '~/services/like.services'

export const getLikeController = async (req: Request, res: Response) => {
  const find = {
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    tweet_id: new ObjectId(req.params.tweet_id)
  }
  const like = await likeService.getLike(find.tweet_id, find.user_id)
  const status = like ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = like ? LIKE_MESSAGES.GET_LIKE_SUCCESS : LIKE_MESSAGES.GET_LIKE_FAILURE
  res.status(status).json({
    result: {
      like
    },
    message
  })
}

export const createLikeController = async (req: Request, res: Response) => {
  const like = {
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    tweet_id: new ObjectId(req.params.tweet_id)
  }
  const result = await likeService.createLike(like)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? LIKE_MESSAGES.LIKE_SUCCESS : LIKE_MESSAGES.LIKE_FAILURE
  res.status(status).json({
    result,
    message
  })
}

export const unlikeController = async (req: Request, res: Response) => {
  const like = {
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    tweet_id: new ObjectId(req.params.tweet_id)
  }
  const result = await likeService.unlike(like)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? LIKE_MESSAGES.UNLIKE_SUCCESS : LIKE_MESSAGES.UNLIKE_FAILURE
  res.status(status).json({
    result,
    message
  })
}
