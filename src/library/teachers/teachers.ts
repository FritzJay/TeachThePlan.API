import { Teacher, ITeacherModel } from '../../models/teacher.model'
import { Types } from 'mongoose'
import { getUserByEmail, IUser, createUser } from '../users/users'
import { getClassesByTeacherID, getClassByID } from '../classes/classes';
import { IClassModel } from '../../models/class.model';

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

  return Teacher.findById(teacherID).exec()
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

export const addClassToTeacher = async (newClass: IClassModel, teacherID: string): Promise<ITeacherModel> => {
  console.log('Adding class to teacher', newClass, teacherID)

  const teacher = await getTeacherByID(teacherID)

  const classes = await getClassesByTeacherID(teacherID)

  if (classes.some((c) => c._id === newClass.id)) {
    throw new Error(`Teacher already has a class with an _id of ${newClass._id}`)
  }

  if (classes.some((c) => c.name === newClass.name)) {
    throw new Error(`Teacher already has a class with a name of ${newClass.name}`)
  }

  teacher.classIDs.push(newClass._id)
  return teacher.save()
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
