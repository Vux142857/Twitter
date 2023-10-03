import { Request, Response } from 'express'
import userService from '~/services/users.services'
import { ParamsDictionary } from 'express-serve-static-core'
import RegisterReqBody from '~/models/requests/User.requests'

export const loginController = (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Login successfully !'
  })
}

// date_of_birth: iso_string
export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response) => {
  const result = await userService.register(req.body)
  res.status(200).json({
    result,
    message: 'Register successfully !'
  })
}
