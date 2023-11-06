import { Router } from 'express'
const mediaRouter = Router()
import { uploadSingleImageController, uploadMultipleImageController } from '~/controllers/media.controllers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { wrapAsync } from '~/utils/handler'

mediaRouter.post('/upload-image', accessTokenValidator, wrapAsync(uploadSingleImageController))
mediaRouter.post('/upload-images', accessTokenValidator, wrapAsync(uploadMultipleImageController))

export default mediaRouter
