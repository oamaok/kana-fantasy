import jwt from 'jsonwebtoken'

export type JwtData = {
  id: string
  isAdmin: boolean
  accessToken: string
  refreshToken: string
}

export const verify = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JwtData
  } catch (err) {
    return null
  }
}

export const sign = (data: JwtData) => {
  return jwt.sign(data, process.env.JWT_SECRET!)
}
