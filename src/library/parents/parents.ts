import { Parent, IParentModel } from '../../models/parent.model'
import { Types } from 'mongoose'
import { IUser, createUser } from '../users/users';

export interface IParent {
  userID: Types.ObjectId,
  displayName: string,
}

export const createParent = async (userParams: IUser): Promise<IParentModel> => {
  console.log('Creating a new parent', userParams)

  const { email, password } = userParams
  const userType = [ 'parent' ]

  const user = await createUser({ email, password, userType })

  try {
    return await new Parent({ userID: user._id, displayName: email }).save()

  } catch(error) {
    console.log(`Unable to create a new parent using _id ${user._id}`, error)
    await user.remove()
    console.log(`Removed user with _id ${user._id}`)
  }
}