import { Router } from 'express'
import { searchTweets } from '~/controllers/search.controller'
import { accessTokenValidator, isUserLoggedInValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'
const searchRouter = Router()

// *********************** GET ***********************
// WIP: 80% - 90%
// Desciption: Search tweets
// Route: /api/search
// Method: GET
// Response OK: {data: {result: {tweets: Tweet}}, message}
searchRouter.get('/', isUserLoggedInValidator(accessTokenValidator), wrapAsync(searchTweets))

export default searchRouter
