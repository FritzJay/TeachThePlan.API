import { Teacher, ITeacherModel } from '../../models/teacher.model'
import { Types } from 'mongoose'
import { getUserByEmail, IUser, createUser } from '../users/users'

export interface ITeacher {
  userID: Types.ObjectId,
  displayName: string,
  classIDs: string[],
}

export const createTeacher = async (userParams: IUser): Promise<ITeacherModel> => {
  console.log('Creating a new teacher:', userParams)

  const userType = [ 'teacher' ]
  const { email, password } = userParams

  const user = await createUser({ email, password, userType })

  try {
    return await new Teacher({ userID: user._id, displayName: email }).save()

  } catch (error) {
    console.log(`Unable to create a new teacher using _id ${user._id}`, error)
    await user.remove()
    console.log(`Removed user with _id ${user._id}`)
  }
}


export const getTeacherByEmail = async (email: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by email')
  console.log(`email: ${email}`)

  const user = await getUserByEmail(email)
  return await Teacher.findOne({ userID: user._id })
}

export const getTeacherByID = async (teacherID: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by teacherID', teacherID)

  return Teacher.findById(teacherID)
}

export const getTeacherByUserID = (userID: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by userID')
  console.log(`UserID: ${userID}`)
  return new Promise((resolve, reject) => {
    Teacher.findOne({ userID: userID })
    .exec()
    .then((teacher: ITeacherModel) => {
      if (teacher) {
        resolve(teacher)
      } else {
        reject(new Error('Unable to find teacher'))
      }
    })
    .catch((error) => {
      reject(error)
    })
  })
}

export const addClassToTeacher = async (classID: string, teacherID: string): Promise<ITeacherModel> => {
  console.log('Adding class to teacher', classID, teacherID)

  const teacher = await getTeacherByID(teacherID)

  teacher.classIDs.push(classID)
  await teacher.save()

  return teacher
}

export const removeTeacherByID = (teacherID: Types.ObjectId): Promise<ITeacher> => {
  return new Promise((resolve, reject) => {
    Teacher.findByIdAndRemove(teacherID)
    .then((teacher: ITeacherModel) => {
      resolve(teacher)
    })
    .catch((error) => {
      reject(error)
    })
  })
}
