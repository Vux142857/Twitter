import express, { NextFunction, Request, Response } from 'express'
import userRouter from './routes/users.routes'
import databaseService from './services/database/database.services'
import 'dotenv/config'
import { defaultErrorHandler } from './middlewares/errors.middlewares'

const app = express()
const port = 3000
databaseService.connect()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/user', userRouter)

app.use(defaultErrorHandler)
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
