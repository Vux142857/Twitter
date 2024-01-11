import fs from 'fs'
import path from 'path'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIA_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Error'

export const initFolder = async (dirPath: string) => {
  try {
    const newFolder = path.resolve(dirPath)
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

export const deleteFile = async (filePath: string) => new Promise<boolean>((resolve, reject) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.log(err)
      reject(new ErrorWithStatus({ message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR, status: HTTP_STATUS.INTERNAL_SERVER_ERROR }))
    }
    resolve(true)
  })
})

export const clearAllFile = async (dirPath: string) => {
  try {
    const files = await fs.readdirSync(dirPath)
    const deleteFilePromises = files.map(file =>
      fs.unlinkSync(path.join(dirPath, file))
    )
    await Promise.all(deleteFilePromises)
  } catch (err) {
    console.log(err)
    throw new ErrorWithStatus({ message: MEDIA_MESSAGES.INTERNAL_SERVER_ERROR, status: HTTP_STATUS.INTERNAL_SERVER_ERROR })
  }
}