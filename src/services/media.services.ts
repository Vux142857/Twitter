/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express'
import formidable, { File } from 'formidable'
import 'dotenv/config'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { MediaType, StatusType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import { S3_FOLDER, UPLOAD_FOLDER } from '~/constants/uploadFolder'
import Media from '~/models/schemas/Media.schema'
import { ErrorWithStatus } from '~/models/Error'
import { clearAllFile, deleteFile } from '~/utils/file'
import { encodeHLSWithMultipleVideoStreams } from '../libs/encodeHLS.services.js'
import cryto from 'crypto'
import path from 'path'
import fs from 'fs'
import databaseService from './database/database.services.js'
import s3Services from './database/s3.services.js'
import mime from 'mime-types'
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const newFile = await sharp(file.filepath)
      .withMetadata()
      .jpeg()
      .toFile(UPLOAD_FOLDER.IMAGES + `/${file.newFilename}.jpg`)
    const newFilePath = UPLOAD_FOLDER.IMAGES + `/${file.newFilename}.jpg`
    const uploadToS3 = await s3Services.uploadFile(
      `${S3_FOLDER.IMAGES + file.newFilename}.jpg`,
      newFilePath,
      'image/jpeg'
    )
    const [removeTemp, reomveLocalFile] = await Promise.all([deleteFile(file.filepath), deleteFile(newFilePath)])
    if (removeTemp && reomveLocalFile && uploadToS3) {
      const url = uploadToS3.Location as string
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
      form.parse(req, async (err, fields, files) => {
        if (err as ErrorWithStatus) {
          reject(err)
        }
        if (!files || Object.keys(files).length === 0 || !files.file) {
          reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.VIDEO_IS_REQUIRED, status: HTTP_STATUS.BAD_REQUEST }))
        } else {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const uploadToS3 = await s3Services.uploadFile(
            `${S3_FOLDER.VIDEOS + files.file[0].newFilename}`,
            files.file[0].filepath,
            'video/mp4'
          )
          const url = isProduction
            ? `${process.env.HOST}/static/video/${files.file[0].newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${files.file[0].newFilename}`
          const videoObj = { url, type: MediaType.Video, status: StatusType.Done }
          Promise.all([this.storageMedia(videoObj), deleteFile(files.file[0].filepath)])
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
            console.log('encodeHLSWithMultipleVideoStreams -DONE')
            await deleteFile(filePath)
            const files = getFiles(folderPath, [])
            await Promise.all(
              files.map((file) => {
                const filename = S3_FOLDER.VIDEOS_HLS + videoID + file.replace(folderPath, '')
                return s3Services.uploadFile(filename, file, mime.lookup(file) as string)
              })
            )
            videoObj.status = StatusType.Done
            await Promise.all([clearAllFile(folderPath), this.storageMedia(videoObj)])
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
  const videoID = cryto.randomUUID()
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

// Recursive function to get files
function getFiles(dir: string, files: string[]) {
  // Get an array of all files and directories in the passed directory using fs.readdirSync
  const fileList = fs.readdirSync(dir)
  // Create the full path of the file/directory by concatenating the passed directory and file/directory name
  for (const file of fileList) {
    const name = `${dir}/${file}`
    // Check if the current file/directory is a directory using fs.statSync
    if (fs.statSync(name).isDirectory()) {
      // If it is a directory, recursively call the getFiles function with the directory path and the files array
      getFiles(name, files)
    } else {
      // If it is a file, push the full path to the files array
      files.push(name)
    }
  }
  return files
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
