import { Request, Response } from 'express'
import mediaService from '~/services/media.services'

export const uploadImageSingleController = async (req: Request, res: Response) => {
  const file = await mediaService.uploadImageSingle(req)
  const result = await mediaService.compressImage(file)
  res.status(200).json(result)
}
