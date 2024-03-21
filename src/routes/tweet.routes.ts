import { Router, Request, Response } from 'express'
import {
  createTweetController,
  getTweetByFollowed,
  getTweetByIdController,
  getTweetChildrenController,
  getTweetsByHashtag,
  getTweetsByViews
} from '~/controllers/tweet.controllers'
import {
  audienceValidator,
  createTweetValidator,
  hashtagValidator,
  tweetIdValidator,
  tweetQueryValidator
} from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifedUserValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'
const tweetRouter = Router()

// *********************** GET ***********************
// WIP: 80% - 90%
// Desciption: Get tweet by id
// Route: /api/tweet/:id
// Method: GET
// Response OK: {data: {result: {tweet: Tweet}}, message}
tweetRouter.get(
  '/:tweet_id',
  isUserLoggedInValidator(accessTokenValidator),
  verifedUserValidator,
  audienceValidator,
  tweetIdValidator,
  wrapAsync(getTweetByIdController)
)

// WIP: 80% - 90%
// Desciption: Get tweet's children by id
// Route: /api/tweet/:tweet_id/children
// Query: {type, skip, limit}:{number, number, number}
// Method: GET
// Response OK: {data: {result: { tweetChildren, total, totalPage, skip, limit }, message}
tweetRouter.get(
  '/:tweet_id/children',
  isUserLoggedInValidator(accessTokenValidator),
  verifedUserValidator,
  audienceValidator,
  tweetQueryValidator,
  tweetIdValidator,
  wrapAsync(getTweetChildrenController)
)

// WIP: 80% - 90%
// Desciption: Get tweet by followed
// Route: /api/tweet/followed
// Query: {type, skip, limit}:{number, number, number}
// Method: GET
// Response OK: {data: {result: { tweetsByFollowed, totalFollowedUser, skip, limit }, message}
tweetRouter.get(
  '/newfeeds/followed',
  accessTokenValidator,
  verifedUserValidator,
  tweetQueryValidator,
  wrapAsync(getTweetByFollowed)
)

// WIP: 80% - 90%
// Desciption: Get tweet by views
// Route: /api/tweet/trending/views
// Query: {type, skip, limit}:{number, number, number}
// Method: GET
// Response OK: {data: {result: { tweetsByViews, skip, limit }, message}
tweetRouter.get(
  '/trending/views',
  // isUserLoggedInValidator(accessTokenValidator),
  tweetQueryValidator,
  wrapAsync(getTweetsByViews)
)

// WIP: 80% - 90%
// Desciption: Get tweet by hashtags
// Route: /api/tweet/hashtag/:name
// Query: {type, skip, limit}:{number, number, number}
// Method: GET
// Response OK: {data: {result: { tweetsByViews, skip, limit }, message}
tweetRouter.get(
  '/hashtag/:name',
  isUserLoggedInValidator(accessTokenValidator),
  hashtagValidator,
  tweetQueryValidator,
  wrapAsync(getTweetsByHashtag)
)

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Create tweet
// Route: /api/tweet/create-tweet
// Method: POST
// Response OK: {data: {result: {tweet: Tweet}}, message}
tweetRouter.post(
  '/create-tweet',
  accessTokenValidator,
  verifedUserValidator,
  createTweetValidator,
  wrapAsync(createTweetController)
)

// *********************** FOR TESTING ONLY ***********************
tweetRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.tweets.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default tweetRouter
