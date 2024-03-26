/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express'
import { BOOKMARK_MESSAGES } from '~/constants/messages'
import bookmarkService from '~/services/bookmark.services'
import { ObjectId } from 'mongodb'
import HTTP_STATUS from '~/constants/httpStatus'

export const getBookmarksController = async (req: Request, res: Response) => {
  const find = {
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    tweet_id: new ObjectId(req.params.tweet_id)
  }
  const bookmark = await bookmarkService.getBookmark(find.tweet_id, find.user_id)
  const status = bookmark ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = bookmark ? BOOKMARK_MESSAGES.GET_BOOKMARK_SUCCESS : BOOKMARK_MESSAGES.GET_BOOKMARK_FAILURE
  res.status(status).json({
    result: {
      bookmark
    },
    message
  })
}

export const getBookmarksListController = async (req: Request, res: Response) => {
  const { skip, limit } = req.query
  const result = await bookmarkService.getBookmarksList(
    new ObjectId(req.decoded_authorization?.user_id),
    parseInt(skip as string),
    parseInt(limit as string)
  )
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? BOOKMARK_MESSAGES.GET_BOOMARKS_SUCCESS : BOOKMARK_MESSAGES.GET_BOOMARKS_FAILURE
  res.status(status).json({
    result,
    message
  })
}

export const createBookmarkController = async (req: Request, res: Response) => {
  const bookmark = {
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    tweet_id: new ObjectId(req.params.tweet_id)
  }
  const result = await bookmarkService.createBookmark(bookmark)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? BOOKMARK_MESSAGES.BOOKMARK_SUCCESS : BOOKMARK_MESSAGES.BOOKMARK_FAILURE
  res.status(status).json({
    result,
    message
  })
}

export const unbookmarkController = async (req: Request, res: Response) => {
  const bookmark = {
    user_id: new ObjectId(req.decoded_authorization?.user_id),
    tweet_id: new ObjectId(req.params.tweet_id)
  }
  const result = await bookmarkService.unbookmark(bookmark)
  const status = result ? HTTP_STATUS.OK : HTTP_STATUS.BAD_REQUEST
  const message = result ? BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESS : BOOKMARK_MESSAGES.UNBOOKMARK_FAILURE
  res.status(status).json({
    result,
    message
  })
}
