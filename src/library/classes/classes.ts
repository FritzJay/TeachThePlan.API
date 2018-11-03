import { IClass } from '../classes/classes'
import { Class, IClassModel } from '../../models/class.model'
import { addClassToTeacher } from '../teachers/teachers'
import { Types } from 'mongoose'

export interface IClass {
  classCode: string,
  grade: string,
  name: string,
  studentIDs?: Types.ObjectId[],
}

export const createClass = async (classParams: IClass, teacherID: string): Promise<IClassModel> => {
  console.log('Creating a new class', classParams, teacherID)

  const { grade, name } = classParams

  const newClass = await new Class({ grade, name }).save()

  try {
    await addClassToTeacher(newClass._id, teacherID)

    return newClass

  } catch(error) {
    Class.remove(newClass._id)
    throw error
  }
}

export const getClassByClassCode = (classCode: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    Class.findOne({classCode: classCode})
    .exec()
    .then((cls: IClassModel) => {
      if (cls) {
        resolve(cls)
      } else {
        reject(new Error('Unable to find class'))
      }
    })
  })
}

export const addStudentToClass = (studentID: Types.ObjectId, classCode: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      cls.studentIDs.push(studentID)
      cls.save()
      .then((cls: IClassModel) => {
        resolve(cls)
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

export const removeClassByClassCode = (classCode: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      cls.remove()
      .then((cls: IClassModel) => {
        resolve(cls)
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
