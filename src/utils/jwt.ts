import jwt, { SignOptions } from 'jsonwebtoken'
import 'dotenv/config'
import { TokenPayload } from '~/models/requests/User.requests'

export const signToken = ({ payload, privateKey, options = {
  algorithm: 'HS256'
} }: {
  payload: string | Buffer | object,
  privateKey: string,
  options?: SignOptions
}) => {
  return new Promise<string>((resolve, rejects) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if (error) {
        throw rejects(error)
      }
      resolve(token as string)
    })
  })
}

export const verifyToken = ({ token, secretKey }: { token: string, secretKey: string }) => {
  return new Promise<TokenPayload>((resolve, rejects) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        throw rejects(error)
      }
      resolve(decoded as TokenPayload)
    })
  })
}