import { Router, Request, Response } from 'express'
import { createLikeController, getLikeController, unlikeController } from '~/controllers/like.controller'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'

const likeRouter = Router()

// *********************** GET ***********************
// WIP: 90% - 100%
// Desciption: Get bookmarks of Tweet
// Route: /api/bookmark/get-bookmarks/:tweet_id
// Method: GET
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {bookmarks: Bookmark[]}}, message}
likeRouter.get('/get-like/:tweet_id', accessTokenValidator, tweetIdValidator, wrapAsync(getLikeController))

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Create bookmark
// Route: /api/bookmark/create-bookmark
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {bookmark: Bookmark}}, message}
likeRouter.post('/create-like/:tweet_id', accessTokenValidator, tweetIdValidator, wrapAsync(createLikeController))

// WIP: 90% - 100%
// Desciption: Unbookmark
// Route: /api/bookmark/unbookmark
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {bookmark: Bookmark}}, message}
likeRouter.delete('/unlike/:tweet_id', accessTokenValidator, tweetIdValidator, wrapAsync(unlikeController))

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
