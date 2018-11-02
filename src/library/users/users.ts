import { hash } from 'bcrypt'
import { Types } from 'mongoose'
import { User, IUserModel } from '../../models/user.model'
import { verifyToken } from '../authentication/authentication'

export interface IUser {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  userType?: string[]
}

export const createUser = async (userParams: IUser): Promise<IUserModel> => {
  console.log('Creating a new user:', userParams)

  const { email, password, firstName, lastName, userType } = userParams

  const hashedPassword = await hash(password, 10)

  await assertUserWithEmailDoesNotExist(email)

  return await new User({
    email,
    password: hashedPassword,
    firstName,
    lastName,
    userType,
  })
  .save()
}

const assertUserWithEmailDoesNotExist = async (email: string) => {
  const user = await User.findOne({ email }).exec()

  if (user !== null) {
    throw new Error(`User with an email of ${email} already exists`)
  }
}

export const getUserFromToken = async (token: string): Promise<IUserModel> => {
  console.log('Getting user from token')
  console.log(`token: ${token}`)

  const decodedToken = await verifyToken(token)
  const email = decodedToken['email']

  return getUserByEmail(email)
}

export const getUserByEmail = async (email: string): Promise<IUserModel> => {
  console.log('Getting user by email')
  console.log(`email: ${email}`)

  const user = await User.findOne({ email }).exec()

  if (user !== undefined && user !== null) {
    return user
  } else {
    console.log(`Could not find the user with an email of ${email}`)
    throw new Error(`Could not find the user with an email of ${email}`)
  }
}

export const getUserByID = async (id: Types.ObjectId): Promise<IUserModel> => {
  console.log('Getting user by userID')
  console.log(`userID: ${id}`)

  const user = await User.findById(id).exec()

  if (user !== undefined && user !== null) {
    return user
  } else {
    console.log(`Could not find the user with an id of ${id}`)
    throw new Error(`Could not find the user with an id of ${id}`)
  }
}

export const removeUserByID = async (id: Types.ObjectId): Promise<IUserModel> => {
  console.log('Removing user by userID')
  console.log(`userID: ${id}`)

  return User.findByIdAndRemove(id)
}