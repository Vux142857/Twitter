import { Router, Request, Response } from 'express'
const mediaRouter = Router()
import { uploadImageSingleController } from '~/controllers/media.controllers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

mediaRouter.post('/upload-image', accessTokenValidator, wrapAsync(uploadImageSingleController))
mediaRouter.post('/upload-images', accessTokenValidator, wrapAsync(uploadImageSingleController))

export default mediaRouter
