import HTTP_STATUS from "~/constants/httpStatus"
import USERS_MESSAGES from "~/constants/messages"

type ErrorType = Record<string, { msg: string, [key: string]: any }>

export class ErrorWithStatus {
  message: string
  status: number

  constructor({ message, status }: { message: string, status: number }) {
    this.message = message
    this.status = status
  }
}

export class EntityError extends ErrorWithStatus {
  errors: ErrorType
  constructor({ message = USERS_MESSAGES.VALIDATION_ERROR, errors }: { message?: string, errors: ErrorType }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY })
    this.errors = errors
  }
}