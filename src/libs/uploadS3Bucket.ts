import { S3Client, ListBucketsCommand } from '@aws-sdk/client-s3'
import 'dotenv/config'

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

s3.send(new ListBucketsCommand({})).then((data) => {
  console.log(data)
})
