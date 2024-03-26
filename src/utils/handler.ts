import { NextFunction, Request, Response } from "express"

export const wrapAsync = (func: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next)
    } catch (err) {
      next(err)
    }
  }
}

export const wrapSocketAsync = (func: any) => {
  return async (socket: any, next: any) => {
    try {
      await func(socket, next)
    } catch (err) {
      next(err)
    }
  }
}