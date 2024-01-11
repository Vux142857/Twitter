import { Request, Response } from 'express'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import UPLOAD_FOLDER from '~/constants/uploadFolder'
import { Media } from '~/models/Another'
import mediaService from '~/services/media.services'
import fs from 'fs'

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

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideo(req)
  res.status(200).json({
    message: MEDIA_MESSAGES.UPLOAD_VIDEO_SUCCESS,
    data: result
  })
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediaService.uploadVideoHLS(req)
  res.status(200).json({
    message: MEDIA_MESSAGES.UPLOAD_VIDEO_SUCCESS,
    data: result
  })
}

export const serveImageController = async (req: Request, res: Response) => {
  const name = req.params.name
  return res.sendFile(path.resolve(UPLOAD_FOLDER.IMAGES, name), (error) => {
    if (error) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        message: MEDIA_MESSAGES.IMAGE_NOT_FOUND
      })
    }
  })
}

export const streamStaticVideoController = async (req: Request, res: Response) => {
  const name = req.params.name
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send({
      message: MEDIA_MESSAGES.RANGE_VIDEO_IS_REQUIRED
    })
  }
  const videoPath = path.resolve(UPLOAD_FOLDER.VIDEOS, name)
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 // decimal = 1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4'
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}