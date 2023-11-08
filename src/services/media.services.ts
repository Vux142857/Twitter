/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from 'express'
import formidable, { File } from 'formidable'
import 'dotenv/config'
import sharp from 'sharp'
import { isProduction } from '~/constants/config'
import { MediaType } from '~/constants/enum'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import UPLOAD_FOLDER from '~/constants/uploadFolder'
import { Media } from '~/models/Another'
import { ErrorWithStatus } from '~/models/Error'
import { deleteFile, renameFile } from '~/utils/file'
import YoutubeMp3Downloader from '../../lib/YoutubeMp3Downloader'
import ffmpegStatic from 'ffmpeg-static'

class MediaService {
  private YD: YoutubeMp3Downloader
  constructor() {
    this.YD = new YoutubeMp3Downloader({
      ffmpegPath: ffmpegStatic as string,
      outputPath: UPLOAD_FOLDER.AUDIOS,
      youtubeVideoQuality: 'highestaudio',
      queueParallelism: 2,
      progressTimeout: 2000,
      allowWebm: false
    })
  }
  async uploadImageSingle(req: Request) {
    const options = {
      maxFiles: 1,
      uploadDir: UPLOAD_FOLDER.TEMP,
      maxFileSize: 3 * 1024 * 1024,
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
    const options = {
      maxFiles: 4,
      uploadDir: UPLOAD_FOLDER.TEMP,
      maxFileSize: 3 * 1024 * 1024,
      maxTotalFileSize: 12 * 1024 * 1024,
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
  async compressImage(file: File) {
    const newFile = await sharp(file.filepath)
      .withMetadata()
      .jpeg()
      .toFile(UPLOAD_FOLDER.IMAGES + `/${file.newFilename}.jpg`)
    const removeTemp = await deleteFile(file.filepath)
    if (newFile && removeTemp) {
      const url = isProduction
        ? `${process.env.HOST}/static/image/${file.newFilename}.jpg`
        : `http://localhost:${process.env.PORT}/static/image/${file.newFilename}.jpg`
      return { url, type: MediaType.Image }
    }
    throw new ErrorWithStatus({
      message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR
    })
  }

  async uploadVideo(req: Request) {
    const options = {
      maxFiles: 1,
      uploadDir: UPLOAD_FOLDER.VIDEOS,
      maxFileSize: 50 * 1024 * 1024,
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
      }
    }
    const form = formidable(options)
    return new Promise<Media>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err as ErrorWithStatus) {
          reject(err)
        }
        if (!files || Object.keys(files).length === 0 || !files.file) {
          reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.VIDEO_IS_REQUIRED, status: HTTP_STATUS.BAD_REQUEST }))
        } else {
          files.file[0].newFilename = files.file[0].newFilename + '.mp4'
          renameFile(files.file[0].filepath, files.file[0].filepath + '.mp4')
          const url = isProduction
            ? `${process.env.HOST}/static/video/${files.file[0].newFilename}`
            : `http://localhost:${process.env.PORT}/static/video/${files.file[0].newFilename}`
          resolve({ url, type: MediaType.Video })
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

  async ytbToMp3(id: string) {
    try {
      await this.YD.download(id, `${id}.mp3`)
      await this.YD.on('finished', function (err, data) {
        console.log(JSON.stringify(data))
      })
      console.log(123)
    } catch (error) {
      this.YD.on('error', function (error) {
        console.log(error)
      })
    }
  }
}

const mediaService = new MediaService()
export default mediaService
