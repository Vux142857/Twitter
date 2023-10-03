import jwt, { SignOptions } from 'jsonwebtoken'
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