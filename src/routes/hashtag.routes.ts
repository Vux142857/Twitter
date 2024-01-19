import { Router, Request, Response } from 'express'
import databaseService from '~/services/database/database.services'
import { wrapAsync } from '~/utils/handler'
const hashtagRouter = Router()

// *********************** GET ***********************
// hashtagRouter.get('/create-hashtag',create)

// *********************** FOR TESTING ONLY ***********************
hashtagRouter.post(
  '/clear-database',
  wrapAsync((req: Request, res: Response) => {
    databaseService.users.deleteMany({})
    res.status(200).json({
      result: 'done!'
    })
  })
)

export default hashtagRouter
