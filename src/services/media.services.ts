/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express'
import formidable, { File } from 'formidable'
import 'dotenv/config'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { MediaType, StatusType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import UPLOAD_FOLDER from '~/constants/uploadFolder'
import Media from '~/models/schemas/Media.schema'
import { ErrorWithStatus } from '~/models/Error'
import { deleteFile } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '../../lib/encodeHLS.services'
import { nanoid } from 'nanoid'
import path from 'path'
import fs from 'fs'
import databaseService from './database/database.services'

class MediaService {
  async uploadImageSingle(req: Request) {
    const isMultiple = false
    const options = optionsUploadImage(isMultiple, req)
    const form = formidable(options)
    return new Promise<File>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err as ErrorWithStatus) {
          reject(err)
        }
        if (!files || Object.keys(files).length === 0 || !files.file) {
          reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.IMAGE_IS_REQUIRED, status: HTTP_STATUS.BAD_REQUEST }))
        } else {
          resolve(files.file[0])
        }
        reject(
          new ErrorWithStatus({
            message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      })
    })
  }

  async uploadImageMultiple(req: Request) {
    const isMultiple = true
    const options = optionsUploadImage(isMultiple, req)
    const form = formidable(options)
    return new Promise<File[]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        }
        if (!files || Object.keys(files).length === 0 || !files.file) {
          reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.IMAGE_IS_REQUIRED, status: HTTP_STATUS.BAD_REQUEST }))
        } else {
          resolve(files.file)
        }
        reject(
          new ErrorWithStatus({
            message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      })
    })
  }

  async compressAndStorageImage(file: File) {
    const newFile = await sharp(file.filepath)
      .withMetadata()
      .jpeg()
      .toFile(UPLOAD_FOLDER.IMAGES + `/${file.newFilename}.jpg`)
    const removeTemp = await deleteFile(file.filepath)
    if (newFile && removeTemp) {
      const url = isProduction
        ? `${process.env.HOST}/static/image/${file.newFilename}.jpg`
        : `http://localhost:${process.env.PORT}/static/image/${file.newFilename}.jpg`
      const imageObj = { url, type: MediaType.Image, status: StatusType.Done }
      await this.storageMedia(imageObj)
      return imageObj
    }
    throw new ErrorWithStatus({
      message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR
    })
  }

  async uploadVideo(req: Request) {
    const isHLS = false
    const { options } = optionsUploadVideo(isHLS)
    const form = formidable(options)
    return new Promise<Media>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err as ErrorWithStatus) {
          reject(err)
        }
        if (!files || Object.keys(files).length === 0 || !files.file) {
          reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.VIDEO_IS_REQUIRED, status: HTTP_STATUS.BAD_REQUEST }))
        } else {
          const url = isProduction
            ? `${process.env.HOST}/static/video/${files.file[0].newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${files.file[0].newFilename}`
          const videoObj = { url, type: MediaType.Video, status: StatusType.Done }
          this.storageMedia(videoObj)
          resolve(videoObj)
        }
        reject(
          new ErrorWithStatus({
            message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      })
    })
  }

  async uploadVideoHLS(req: Request) {
    const isHLS = true
    const { folderPath, options, videoID } = optionsUploadVideo(isHLS)
    fs.mkdirSync(folderPath)
    const form = formidable(options)
    return new Promise<Media>((resolve, reject) => {
      form.parse(req, async (err, fields, files) => {
        if (err as ErrorWithStatus) {
          reject(err)
        }
        if (!files || Object.keys(files).length === 0 || !files.file) {
          reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.VIDEO_IS_REQUIRED, status: HTTP_STATUS.BAD_REQUEST }))
        } else {
          const filePath = files.file[0].filepath
          const url = isProduction
            ? `${process.env.HOST}/static/video-hls/${videoID}/master.m3u8`
            : `http://localhost:${process.env.PORT}/static/video-hls/${videoID}/master.m3u8`
          const videoObj = { url, type: MediaType.Video, status: StatusType.Pending }
          resolve(videoObj)
          try {
            await encodeHLSWithMultipleVideoStreams(filePath)
            videoObj.status = StatusType.Done
            await Promise.all([deleteFile(filePath), this.storageMedia(videoObj)])
          } catch (error) {
            throw new ErrorWithStatus({
              message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
              status: HTTP_STATUS.INTERNAL_SERVER_ERROR
            })
          }
        }
        reject(
          new ErrorWithStatus({
            message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
            status: HTTP_STATUS.INTERNAL_SERVER_ERROR
          })
        )
      })
    })
  }

  async storageMedia(media: Media) {
    return await databaseService.media.insertOne(media)
  }

  async updateStatusMedia(url: string, status: StatusType) {
    return await databaseService.media.updateOne(
      { url },
      {
        $set: { status },
        $currentDate: { updated_at: true }
      }
    )
  }
}

const mediaService = new MediaService()
export default mediaService

// Utils
function optionsUploadImage(isMultiple: boolean, form: any) {
  const maxFiles = isMultiple ? 4 : 1
  const maxFileSize = 3 * 1024 * 1024
  const maxTotalFileSize = isMultiple ? 12 * 1024 * 1024 : 3 * 1024 * 1024
  const options = {
    maxFiles,
    uploadDir: UPLOAD_FOLDER.TEMP,
    maxFileSize,
    maxTotalFileSize,
    filter: function ({ mimetype }: any) {
      const valid = mimetype && mimetype.includes('image')
      if (valid === false) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({
            message: MEDIA_MESSAGES.ONLY_IMAGES_ARE_ALLOWED,
            status: HTTP_STATUS.BAD_REQUEST
          }) as any
        )
      }
      return valid
    }
  }
  return options
}

function optionsUploadVideo(isHLS: boolean, form?: any) {
  const videoID = nanoid()
  const folderPath = isHLS ? path.resolve(UPLOAD_FOLDER.VIDEOS, videoID) : UPLOAD_FOLDER.VIDEOS
  const options = {
    maxFiles: 1,
    uploadDir: folderPath,
    maxFileSize: 10 * 1024 * 1024,
    filter: function ({ mimetype }: any) {
      const valid = mimetype && mimetype.includes('video')
      if (valid === false) {
        form.emit(
          'error' as any,
          new ErrorWithStatus({
            message: MEDIA_MESSAGES.ONLY_VIDEOS_ARE_ALLOWED,
            status: HTTP_STATUS.BAD_REQUEST
          }) as any
        )
      }
      return valid
    },
    filename: function () {
      return videoID + '.mp4'
    }
  }
  return { folderPath, options, videoID }
}

// Options: Update multiple video HLS
// class Queue {
//   private items: any[]
//   private endcoding: boolean
//   constructor() {
//     this.items = []
//     this.endcoding = false
//   }
//   enqueue(item: any) {
//     this.items.push(item)
//     this.processEncoding()
//   }

//   async processEncoding() {
//     if (this.endcoding) return
//     if (this.items.length === 0) return
//     try {
//       this.endcoding = true
//       const filePath = this.items[0]
//       await encodeHLSWithMultipleVideoStreams(filePath)
//       await deleteFile(filePath)
//       this.items.shift()
//     } catch (error) {
//       new ErrorWithStatus({
//         message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
//         status: HTTP_STATUS.INTERNAL_SERVER_ERROR
//       })
//     }
//     this.endcoding = false
//     this.processEncoding()
//   }
// }
