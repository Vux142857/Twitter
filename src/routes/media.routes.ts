import { Request, Response, Router } from 'express'
import HTTP_STATUS from '~/constants/httpStatus'
import { UPLOAD_FOLDER } from '~/constants/uploadFolder'
const mediaRouter = Router()
import {
  uploadSingleImageController,
  uploadMultipleImageController,
  uploadVideoController,
  uploadVideoHLSController
} from '~/controllers/media.controllers'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { clearAllFile } from '~/utils/file'
import { wrapAsync } from '~/utils/handler'

// *********************** POST ***********************

// WIP: 90% - 100%
// Desciption: Upload single image
// Route: /api/media/upload-image
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: Media}, message}  // Media: {url: string, type: MediaType.Image}
mediaRouter.post('/upload-image', accessTokenValidator, wrapAsync(uploadSingleImageController))

// WIP: 90% - 100%
// Desciption: Upload multiple images
// Route: /api/media/upload-images
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: Media[]}, message}
mediaRouter.post('/upload-images', accessTokenValidator, wrapAsync(uploadMultipleImageController))

// WIP: 70% - 80%
// Desciption: Upload video
// Route: /api/media/upload-video
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: Media}, message}  // Media: {url: string, type: MediaType.Video}
mediaRouter.post('/upload-video', accessTokenValidator, wrapAsync(uploadVideoController))

// WIP: 70% - 80%
// Desciption: Upload video HLS
// Route: /api/media/upload-video-hls
// Method: POST
// Header: {Authorization: Bearer <accessToken> }
// Response OK: {data: {result: Media}, message}  // Media: {url: string, type: MediaType.Video}
mediaRouter.post('/upload-video-hls', accessTokenValidator, wrapAsync(uploadVideoHLSController))

// *********************** FOR TESTING ONLY ***********************
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
