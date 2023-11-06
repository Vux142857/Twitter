import { Request, Response } from 'express'
import { MEDIA_MESSAGES } from '~/constants/messages'
import { Media } from '~/models/Another'
import mediaService from '~/services/media.services'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const file = await mediaService.uploadImageSingle(req)
  const result: Media = await mediaService.compressImage(file)
  res.status(200).json({
    message: MEDIA_MESSAGES.UPLOAD_IMAGE_SUCCESS,
    data: result
  })
}

export const uploadMultipleImageController = async (req: Request, res: Response) => {
  const files = await mediaService.uploadImageMultiple(req)
  const result: Media[] = await Promise.all(files.map(async (file) => await mediaService.compressImage(file)))
  res.status(200).json({
    message: MEDIA_MESSAGES.UPLOAD_IMAGES_SUCCESS,
    data: result
  })
}
