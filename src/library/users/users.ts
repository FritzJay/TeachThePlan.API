import { hash } from 'bcrypt'
import { User, IUserModel } from '../../models/user.model'
import { comparePasswords, createToken } from '../authentication/authentication'

export interface IFormattedUser {
  email: string
  token: string
}

export class FormattedUser {
  public model: IUserModel
  public formatted: IFormattedUser

  constructor(user: IUserModel, token: string) {
    this.model = user
    this.formatted = this.formatUser(user, token)
  }

  private formatUser = ({ email, _id }, token): IFormattedUser => ({
    email,
    token,
  })
}

export const getUserByEmailPasswordAndType = async (email: string, password: string, userType: string): Promise<FormattedUser> => {
  const user = await User.findOne({ email }).exec()
  if (user === null) {
    throw new Error(`There is no user with the email ${email}`)
  }
  if (!user.userType.map((ut) => ut.toLowerCase()).includes(userType.toLowerCase())) {
    throw new Error(`A user was found, but it is not of type ${userType}`)
  }
  const passwordsMatch = await comparePasswords(password, user.password)
  if (!passwordsMatch) {
    throw new Error('Invalid password')
  }
  const token = await createToken(user)
  return new FormattedUser(user, token)
}

export const createUser = async (email: string, password: string): Promise<FormattedUser> => {
  await assertUserWithEmailDoesNotExist(email)
  const hashedPassword = await hash(password, 10)
  const user = await new User({
    email,
    password: hashedPassword,
    userType: ['teacher'],
  })
  .save()
  const token = await createToken(user)
  return new FormattedUser(user, token)
}

const assertUserWithEmailDoesNotExist = async (email: string) => {
  const user = await User.findOne({ email }).exec()

  if (user !== null) {
    throw new Error(`User with an email of ${email} already exists`)
  }
}
