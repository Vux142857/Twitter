import path from 'path'
interface UploadFolder {
  [key: string]: string
}
export const UPLOAD_FOLDER: UploadFolder = {
  IMAGES: path.resolve('uploads/images'),
  VIDEOS: path.resolve('uploads/videos'),
  AUDIOS: path.resolve('uploads/audios'),
  TEMP: path.resolve('uploads/temp')
}

export const S3_FOLDER = {
  IMAGES: 'images/',
  VIDEOS: 'videos/',
  VIDEOS_HLS: 'videos-hls/',
  AUDIOS: 'audios/'
}
