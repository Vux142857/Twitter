import express from 'express'
import userRouter from './routes/user.routes'
import mediaRouter from './routes/media.routes'
import databaseService from './services/database/database.services'
import 'dotenv/config'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import { UPLOAD_FOLDER } from './constants/uploadFolder'
import cors from 'cors'
import staticRouter from './routes/static.routes'
import tweetRouter from './routes/tweet.routes'
import hashtagRouter from './routes/hashtag.routes'
import bookmarkRouter from './routes/bookmark.routes'
import likeRouter from './routes/like.routes'
import searchRouter from './routes/search.routes'
import redisService from './services/database/redis.services'
import messageRouter from './routes/message.routes'
import conversationRouter from './routes/conversation.routes'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { isDev } from './constants/config'
import fakerService from './utils/faker'
import notificationRouter from './routes/notification.route'

// fakerService.clearTweetFaker().then(() => {
//   console.log('done')
// })
const createFakeTweets = () => {
  fakerService.insertMultipleUsersAndFollowerAndTweet()
    .then(() => {
      console.log('done');
    })
    .catch((err) => {
      console.error('Error creating fake tweets:', err);
    });
}

const startInterval = () => {
  setInterval(createFakeTweets, 1000 * 60 * 60 * 24);
  console.log('Interval set to run every 24 hours');
}

startInterval();
console.log(isDev)
// Create upload folders
Object.keys(UPLOAD_FOLDER).forEach((key) => {
  initFolder(UPLOAD_FOLDER[key])
})

const app = express()
app.use(helmet())

app.use(
  cors({
    origin: isDev ? '*' : process.env.CLIENT_ALIAS,
    credentials: true
  })
)

app.use(
  rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    limit: 1000, // Limit each IP to 200 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
  })
)
databaseService.connect().then(async () => {
  await Promise.all([
    databaseService.indexesUsers(),
    databaseService.indexesRefreshTokens(),
    databaseService.indexesFollow(),
    databaseService.indexesHashtag(),
    databaseService.indexesBookmark(),
    databaseService.indexesLike(),
    databaseService.indexesTweet(),
    databaseService.indexesMessage(),
    databaseService.indexesConversation(),
    databaseService.indexesNotification()
  ])
}).catch((err) => { console.log(err) })
redisService.connect()
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
app.use('/notification', notificationRouter)
app.use(defaultErrorHandler)

export default app
