import { Upload } from '@aws-sdk/lib-storage'
import { GetObjectCommand, HeadObjectCommand, S3Client } from '@aws-sdk/client-s3'
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

  async getObjectFileSize(Key: string) {
    const command = new HeadObjectCommand({
      Key,
      Bucket: process.env.AWS_BUCKET_NAME
    })
    const { ContentLength } = await this.client.send(command)
    return ContentLength
  }

  async *initiateObjectStream(filepath: string, start: number, end: number) {
    const streamRange = `bytes=${start}-${end}`
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: filepath,
      Range: streamRange
    })
    const { Body: chunks } = await this.client.send(command)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for await (const chunk of chunks as any) {
      yield chunk
    }
  }
}

const s3Services = new s3Service()
export default s3Services
