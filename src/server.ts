import express from 'express'
import userRouter from './routes/user.routes'
import mediaRouter from './routes/media.routes'
import databaseService from './services/database/database.services'
import 'dotenv/config'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { clearAllFile, initFolder } from './utils/file'
import { UPLOAD_FOLDER } from './constants/uploadFolder'
import agrv from 'minimist'
import cors from 'cors'
import staticRouter from './routes/static.routes'
import tweetRouter from './routes/tweet.routes'
import hashtagRouter from './routes/hashtag.routes'
import bookmarkRouter from './routes/bookmark.routes'
import likeRouter from './routes/like.routes'
import searchRouter from './routes/search.routes'
import os from 'os'
import redisService from './services/database/redis.services'
import messageRouter from './routes/message.routes'
import conversationRouter from './routes/conversation.routes'
// import "./utils/faker"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
process.env.UV_THREADPOOL_SIZE = os.cpus().length
const environment = agrv(process.argv.slice(2)).envi
console.log(environment)
clearAllFile('\\C:\\Users\\Acer\\.deno')
// Create upload folders
Object.keys(UPLOAD_FOLDER).forEach((key) => {
  initFolder(UPLOAD_FOLDER[key])
})

const app = express()

databaseService.connect().then(async () => {
  await Promise.all([
    databaseService.indexesUsers(),
    databaseService.indexesRefreshTokens(),
    databaseService.indexesFollow(),
    databaseService.indexesHashtag(),
    databaseService.indexesBookmark(),
    databaseService.indexesLike(),
    databaseService.indexesTweet()
  ])
})
redisService
  .connect()
  // .then(async () => {
  //   await redisService.createRedisSearchUser()
  // })
  .catch((err) => console.log(err))
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.send('Hello World')
})
app.use('/user', userRouter)
app.use('/tweet', tweetRouter)
app.use('/media', mediaRouter)
app.use('/static', staticRouter)
app.use('/hashtag', hashtagRouter)
app.use('/bookmark', bookmarkRouter)
app.use('/like', likeRouter)
app.use('/search', searchRouter)
app.use('/message', messageRouter)
app.use('/conversation', conversationRouter)

app.use(defaultErrorHandler)

export default app
