import { ITest } from '../tests/tests'
import { Student, IStudentModel } from '../../models/student.model'
import { IClassModel } from '../../models/class.model'
import { addStudentToClass, getClassByClassCode } from '../classes/classes'
import { Types } from 'mongoose'
import { getUserByEmail, IUser, createUser } from '../users/users'
import { User } from '../../models/user.model';

export interface IStudent {
  userID: Types.ObjectId,
  displayName: string,
  tests?: ITest[],
}

export const createStudent = async (userParams: IUser): Promise<IStudentModel> => {
  console.log('Creating a new student', userParams)

  const userType = [ 'student' ]
  const { email, password } = userParams

  const user = await createUser({ email, password, userType })

  try {
    return await new Student({ userID: user._id, displayName: email }).save()

  } catch(error) {
    console.log(`Unable to create a new student using _id ${user._id}`, error)
    await user.remove()
    console.log(`Removed user with _id ${user._id}`)
  }
}

export const getStudentByDisplayNameAndClassCode = (displayName: string, classCode: string): Promise<IStudentModel> => {
  console.log('Getting student by display name and class code')
  console.log(`displayName: ${displayName}`)
  console.log(`classCode: ${classCode}`)
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      Student.findOne({
        displayName: displayName,
        _id: { $in: cls.studentIDs }
      })
      .exec()
      .then((student: IStudentModel) => {
        if (student) {
          resolve(student)
        } else {
          reject(new Error('Could not find student'))
        }
      })
      .catch((error) => {
        reject(error)
      })
    })
    .catch((error) => {
      reject(error)
    })
  })
}

export const getStudentByEmail = async (email: string): Promise<IStudentModel> => {
  console.log('Getting student by email')
  console.log(`email: ${email}`)

  const user = await getUserByEmail(email)
  return await Student.findOne({ userID: user._id }).exec()
}

export const removeStudentByID = (studentID: Types.ObjectId): Promise<IStudentModel> => {
  return new Promise((resolve, reject) => {
    Student.findByIdAndRemove(studentID)
    .then((student: IStudentModel) => {
      resolve(student)
    })
    .catch((error) => {
      reject(error)
    })
  })
}
