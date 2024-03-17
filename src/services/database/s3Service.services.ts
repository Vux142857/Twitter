import { Upload } from '@aws-sdk/lib-storage'
import { S3Client } from '@aws-sdk/client-s3'
import 'dotenv/config'
import 'fs'
import path from 'path'
import fs from 'fs'

class s3Service {
  private client: S3Client
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
      }
    })
  }

  async uploadFile(filename: string, filepath: string, contentType: string) {
    const file = fs.readFileSync(path.resolve(filepath))
    const parallelUploads3 = new Upload({
      client: this.client,
      params: { Bucket: process.env.AWS_BUCKET_NAME, Key: filename, Body: file, ContentType: contentType },
      queueSize: 4,
      partSize: 1024 * 1024 * 5,
      leavePartsOnError: false
    })
    return parallelUploads3.done()
  }
}

const s3Services = new s3Service()
export default s3Services
