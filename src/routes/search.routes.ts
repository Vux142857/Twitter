import { Router } from 'express'
import { searchController } from '~/controllers/search.controller'
import { searchQueryValidator } from '~/middlewares/search.middlewares'
import { accessTokenValidator, isUserLoggedInValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'
const searchRouter = Router()

// *********************** GET ***********************
// WIP: 80% - 90%
// Desciption: Search tweets
// Route: /api/search
// Headers: {Authorization: Bearer <accessToken>}
// Method: GET
// Response OK: {data: {result: {tweets: Tweet}}, message}
searchRouter.get('/', accessTokenValidator, searchQueryValidator, wrapAsync(searchController))

export default searchRouter
