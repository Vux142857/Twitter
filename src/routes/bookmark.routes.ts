import { Router, Request, Response } from 'express'
import { createBookmarkController, unbookmarkController } from '~/controllers/bookmark.controller'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'

const bookmarkRouter = Router()
bookmarkRouter.get('/', (req, res) => {
  res.send('bookmark')
})

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Create bookmark
// Route: /api/bookmark/create-bookmark
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Body: {user_id, tweet_id}
// Response OK: {data: {result: {bookmark: Bookmark}}, message}
bookmarkRouter.post(
  '/create-bookmark/:tweet_id',
  accessTokenValidator,
  tweetIdValidator,
  wrapAsync(createBookmarkController)
)

// WIP: 90% - 100%
// Desciption: Unbookmark
// Route: /api/bookmark/unbookmark
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: {bookmark: Bookmark}}, message}
bookmarkRouter.delete('/unbookmark/:tweet_id', accessTokenValidator, tweetIdValidator, wrapAsync(unbookmarkController))

// *********************** FOR TESTING ONLY ***********************
bookmarkRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.bookmarks.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default bookmarkRouter
