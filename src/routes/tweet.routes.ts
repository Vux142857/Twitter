import { Router, Request, Response } from 'express'
import { createTweetController, getTweetByIdController } from '~/controllers/tweet.controllers'
import { audienceValidator, createTweetValidator, tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifedUserValidator } from '~/middlewares/user.middlewares'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'
const tweetRouter = Router()

// *********************** GET ***********************
// WIP: 0% - 10%
// Desciption: Get tweet by id
// Route: /api/tweet/:id
// Method: GET
// Response OK: {data: {result: {tweet: Tweet}}, message}
tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  verifedUserValidator,
  audienceValidator,
  wrapAsync(getTweetByIdController)
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
