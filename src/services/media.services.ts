import { Request } from 'express'
import formidable, { File } from 'formidable'
import sharp from 'sharp'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import UPLOAD_FOLDER from '~/constants/uploadFolder'
import { ErrorWithStatus } from '~/models/Error'
import { deleteFile } from '~/utils/file'

class MediaService {
  async uploadImageSingle(req: Request) {
    const options = {
      maxFiles: 1,
      uploadDir: UPLOAD_FOLDER.TEMP,
      maxFileSize: 3 * 1024 * 1024,
      filter: function ({ mimetype }: any) {
        // keep only images
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
        if (err) {
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

  async compressImage(file: File) {
    const newFile = await sharp(file.filepath)
      .withMetadata()
      .jpeg()
      .toFile(UPLOAD_FOLDER.IMAGES + `/${file.newFilename}.jpg`)
    const removeTemp = await deleteFile(file.filepath)
    if (newFile && removeTemp) {
      return { message: MEDIA_MESSAGES.UPLOAD_IMAGE_SUCCESS }
    }
    throw new ErrorWithStatus({
      message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR,
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR
    })
  }
}

const mediaService = new MediaService()
export default mediaService
