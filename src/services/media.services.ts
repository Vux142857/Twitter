import { Request } from 'express'
import formidable from 'formidable'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import UPLOAD_FOLDER from '~/constants/uploadFolder'
import { ErrorWithStatus } from '~/models/Error'

class MediaService {
  async uploadImageSingle(req: Request) {
    const options = {
      maxFiles: 1,
      keepExtensions: true,
      uploadDir: path.resolve(UPLOAD_FOLDER.IMAGES),
      maxFileSize: 3 * 1024 * 1024,
      filter: function ({ name, originalFilename, mimetype }: any) {
        // keep only images
        const valid = mimetype && mimetype.includes('image')
        console.log({ name, originalFilename, mimetype })
        if (valid === false) {
          form.emit(
            'error' as any,
            new ErrorWithStatus({ message: 'Only images are allowed', status: HTTP_STATUS.BAD_REQUEST }) as any
          )
        }
        return valid
      }
    }
    const form = formidable(options)
    return new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(new ErrorWithStatus({ message: 'Image is invalid', status: HTTP_STATUS.BAD_REQUEST }))
        }
        if (!files || Object.keys(files).length === 0) {
          reject(new ErrorWithStatus({ message: 'Image is required', status: HTTP_STATUS.BAD_REQUEST }))
        }
        resolve(files)
      })
    })
  }
}

const mediaService = new MediaService()
export default mediaService
