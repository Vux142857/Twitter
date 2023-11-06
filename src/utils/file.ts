import fs from 'fs'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'

export const initFolder = async (nameFolder: string) => {
  try {
    const newFolder = path.resolve(nameFolder)
    if (!fs.existsSync(newFolder)) {
      fs.mkdirSync(newFolder, {
        recursive: true
      })
    }
  } catch (error) {
    console.log(error)
    throw new ErrorWithStatus({ message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }
}

export const deleteFile = async (pathFile: string) => new Promise<boolean>((resolve, reject) => {
  fs.unlink(pathFile, (err) => {
    if (err) {
      console.log(err)
      reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
    }
    resolve(true)
  })
})