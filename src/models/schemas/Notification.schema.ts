import { ObjectId } from "mongodb"
import { ActionNotify } from "../../constants/notification"

export interface NotificationConstructor {
    from: string // username of sender
    to: ObjectId | string
    action: ActionNotify
    link: string
    created_at?: Date
    updated_at?: Date
}

class Notification {
    from: string
    to: ObjectId
    action: ActionNotify
    link: string
    created_at?: Date
    constructor(notification: NotificationConstructor) {
        this.from = notification.from
        this.to = new ObjectId(notification.to)
        this.action = notification.action
        this.link = notification.link
        this.created_at = notification.created_at || new Date()
    }
}
export default Notification

