import { IClass } from '../classes/classes'
import { Class, IClassModel } from '../../models/class.model'
import { addClassToTeacher, getTeacherByUserID, getTeacherByID } from '../teachers/teachers'
import { Types, SchemaTypes } from 'mongoose'

export interface IClass {
  classCode?: string,
  grade: string,
  name: string,
  studentIDs?: Types.ObjectId[],
}

export const createClass = async (classParams: IClass, userID: string): Promise<IClassModel> => {
  console.log('Creating a new class', classParams, userID)

  const { grade, name } = classParams

  const teacher = await getTeacherByUserID(userID)

  const newClass = await new Class({ grade, name, studentIDs: [] }).save()

  try {
    await addClassToTeacher(newClass, teacher._id)

    return newClass

  } catch(error) {
    Class.findByIdAndRemove(newClass._id).exec()

    throw error
  }
}

export const updateClass = async (classID: string, updates: IClass, userID: string): Promise<IClassModel> => {
  console.log('Updating class', updates, userID)

  const { grade, name } = updates

  const teacher = await getTeacherByUserID(userID)
  
  const cls = await getClassByID(classID)

  const classes = await getClassesByTeacherID(teacher._id)

  console.log(classes)

  if (classes.some((c) => c._id.toString() === classID) === false) {
    console.log('Teacher does not contain the given classID', teacher, classID)
    throw new Error('Teacher does not contain the given classID')
  }

  if (classes.some((c) => c._id.toString() !== classID && c.name === name)) {
    console.log('Teacher already contains a different class with the given name', teacher, name)
    throw new Error('Teacher already contains a different class with the given name')
  }


  if (grade !== '' && grade !== undefined && grade !== null) {
    cls.grade = grade
  }

  if (name !== '' && name !== undefined && name !== null) {
    cls.name = name
  }

  return await cls.save()
}

export const deleteClass = async (classID: string, userID: string): Promise<IClassModel> => {
  console.log('Deleting class', classID, userID)

  const teacher = await getTeacherByUserID(userID)

  if (teacher.classIDs.some((id) => id.toString() === classID) === false) {
    console.log('Teacher does not contain the given classID', teacher, classID)
    throw Error('Teacher does not contain the given classID')
  }

  teacher.classIDs = teacher.classIDs.filter((id) => id.toString() !== classID)
  await teacher.save()

  try {
    return Class.findByIdAndRemove(classID)
    
  } catch (error) {
    
    console.log('Error ocurred while removed class the classID will be added back into the teachers classIDs')

    teacher.classIDs = teacher.classIDs.concat(classID)

    await teacher.save()
      .catch((err) => {
        throw new Error(err)
      })

    throw new Error(error)
  }
}

export const getClassByID = async (classID: string): Promise<IClassModel> => {
  return await Class.findById(classID)
}

export const getClassesByTeacherID = async (teacherID: string): Promise<IClassModel[]> => {
  const teacher = await getTeacherByID(teacherID)

  return await Class.find({ _id: { $in: teacher.classIDs } }).exec()
}

export const getClassesByUserID = async (userID: string): Promise<IClassModel[]> => {
  const { _id } = await getTeacherByUserID(userID)

  return await getClassesByTeacherID(_id)
}


// Deprecated 
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

export const removeClassByID = (classID: string): Promise<IClassModel> => {
  return Class.findByIdAndRemove(classID).exec()
}
