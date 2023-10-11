import jwt, { SignOptions } from 'jsonwebtoken'
import 'dotenv/config'

export const signToken = ({ payload, privateKey = process.env.JWT_SECRET as string, options = {
  algorithm: 'HS256'
} }: {
  payload: string | Buffer | object,
  privateKey?: string,
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

export const verifyToken = ({ token, secretKey = process.env.JWT_SECRET as string }: { token: string, secretKey?: string }) => {
  return new Promise<string | object>((resolve, rejects) => {
    jwt.verify(token, secretKey, (error, decoded) => {
      if (error) {
        throw rejects(error)
      }
      resolve(decoded as jwt.JwtPayload)
    })
  })
}