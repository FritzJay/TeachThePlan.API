import { compare } from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'
import { IUserModel } from '../../models/user.model'
import { getUserFromToken } from '../users/users'

export const authorizeUser = async (token: string, userType: string): Promise<IUserModel> => {
  const user = await getUserFromToken(token)
  
  if (user.userType.includes(userType)) {
    return user
  } else {
    console.log('User does not contain the required user type', user, userType)
    throw Error('Invalid user type')
  }
}

export const createToken = async (user: IUserModel): Promise<string> => {
  const { email, _id, userType } = user

  return sign(
    { email, _id, userType, },
    process.env.SECRET,
    { expiresIn: '2h' }
  )
}

export const verifyToken = async (token: string): Promise<string | object> => {
  if (token) {
    return verify(token, process.env.SECRET)
  } else {
    throw new Error('Token cannot be undefined')
  }
}

export const comparePasswords = (raw: string, hash: string): Promise<boolean> => {
  return compare(raw, hash)
}
