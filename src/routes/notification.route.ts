import { Router } from 'express'
import { wrapAsync } from '../utils/handler'
import { accessTokenValidator } from '~/middlewares/user.middlewares'
import { getNotifications } from '~/controllers/notification.controller'
const notificationRouter = Router()

notificationRouter.get('/', accessTokenValidator, wrapAsync(getNotifications))

export default notificationRouter