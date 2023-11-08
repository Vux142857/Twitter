import path from 'path'
interface UploadFolder {
  [key: string]: string
}
const UPLOAD_FOLDER: UploadFolder = {
  IMAGES: path.resolve('uploads/images'),
  VIDEOS: path.resolve('uploads/videos'),
  AUDIOS: path.resolve('uploads/audios'),
  TEMP: path.resolve('uploads/temp')
}

export default UPLOAD_FOLDER
