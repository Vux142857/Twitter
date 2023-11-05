import { Request, Response } from 'express'
import mediaService from '~/services/media.services'

export const uploadImageSingleController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadImageSingle(req)
  res.status(200).json({
    result,
    message: 'Upload image success!'
  })
}
