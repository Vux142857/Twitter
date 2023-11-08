import { Request, Response, Router } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import UPLOAD_FOLDER from '~/constants/uploadFolder'
const mediaRouter = Router()
import {
  uploadSingleImageController,
  uploadMultipleImageController,
  uploadVideoController,
  ytbToMp3Controller
} from '~/controllers/media.controllers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { clearAllFile } from '~/utils/file'
import { wrapAsync } from '~/utils/handler'

mediaRouter.post('/upload-image', accessTokenValidator, wrapAsync(uploadSingleImageController))
mediaRouter.post('/upload-images', accessTokenValidator, wrapAsync(uploadMultipleImageController))
mediaRouter.post('/upload-video', accessTokenValidator, wrapAsync(uploadVideoController))
mediaRouter.post('/ytb-to-mp3/:id', wrapAsync(ytbToMp3Controller))
mediaRouter.post(
  '/clear-images',
  wrapAsync((req: Request, res: Response) => {
    clearAllFile(UPLOAD_FOLDER.IMAGES)
    res.status(HTTP_STATUS.OK).json({
      result: 'done!'
    })
  })
)
mediaRouter.post(
  '/clear-videos',
  wrapAsync((req: Request, res: Response) => {
    clearAllFile(UPLOAD_FOLDER.VIDEOS)
    res.status(HTTP_STATUS.OK).json({
      result: 'done!'
    })
  })
)
mediaRouter.post(
  '/clear-audios',
  wrapAsync((req: Request, res: Response) => {
    clearAllFile(UPLOAD_FOLDER.AUDIOS)
    res.status(HTTP_STATUS.OK).json({
      result: 'done!'
    })
  })
)
export default mediaRouter
