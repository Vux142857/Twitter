import { Router, Request, Response } from 'express'
import { createBookmarkController, unbookmarkController } from '~/controllers/bookmark.controller'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'

const likeRouter = Router()

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Create bookmark
// Route: /api/bookmark/create-bookmark
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Body: {user_id, tweet_id}
// Response OK: {data: {result: {bookmark: Bookmark}}, message}
likeRouter.post('/create-like', accessTokenValidator, tweetIdValidator, wrapAsync(createBookmarkController))

// WIP: 90% - 100%
// Desciption: Unbookmark
// Route: /api/bookmark/unbookmark
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {bookmark: Bookmark}}, message}
likeRouter.delete('/unlike/:tweet_id', accessTokenValidator, wrapAsync(unbookmarkController))

// *********************** FOR TESTING ONLY ***********************
likeRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.likes.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default likeRouter
