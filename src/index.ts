import express from 'express'
import userRouter from './routes/user.routes'
import mediaRouter from './routes/media.routes'
import databaseService from './services/database/database.services'
import 'dotenv/config'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import { initFolder } from './utils/file'
import UPLOAD_FOLDER from './constants/uploadFolder'
import agrv from 'minimist'

const environment = agrv(process.argv.slice(2)).envi
console.log(environment)

// Create upload image folder
initFolder(UPLOAD_FOLDER.IMAGES)
initFolder(UPLOAD_FOLDER.TEMP)
const app = express()
const port = process.env.PORT || 3000
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
