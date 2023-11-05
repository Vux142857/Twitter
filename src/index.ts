import express from 'express'
import userRouter from './routes/user.routes'
import mediaRouter from './routes/media.routes'
import databaseService from './services/database/database.services'
import 'dotenv/config'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/initFolder'
import UPLOAD_FOLDER from './constants/uploadFolder'

// Create upload image folder
initFolder(UPLOAD_FOLDER.IMAGES)
const app = express()
const port = 3000
databaseService.connect().then(async () => {
  await Promise.all([
    databaseService.indexesUsers(),
    databaseService.indexesRefreshTokens(),
    databaseService.indexesFollow()
  ])
})
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', userRouter)
app.use('/media', mediaRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
