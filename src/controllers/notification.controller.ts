import { Request, Response } from "express"
import notificationService from "../services/notification.services"
import { TokenPayload } from "~/models/requests/User.requests"
import HTTP_STATUS from "~/constants/httpStatus"

export const getNotifications = async (req: Request, res: Response) => {
    const { decoded_authorization } = req
    const { skip, limit } = req.query
    const { user_id } = decoded_authorization as TokenPayload
    const notifications = await notificationService.getNotificationsByUserID(
        user_id,
        parseInt(skip as string),
        parseInt(limit as string))
    const status = notifications.length > 0 ? HTTP_STATUS.OK : HTTP_STATUS.NO_CONTENT
    const result = notifications.length > 0 ? notifications : { message: 'No notifications found' }
    res.status(status).json({ result })
}