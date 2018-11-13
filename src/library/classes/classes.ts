import { generate } from 'shortid'

import { Class, IClassModel } from '../../models/class.model'
import { getTestParametersForClass, IFormattedTestParameters, createTestParametersForNewClass, removeTestParametersFromClass } from '../testParameters/testParameters'
import { ITeacherModel } from '../../models/teacher.model'
import { getStudentsByClass, IFormattedStudent } from '../students/students'
import { FormattedTeacher } from '../teachers/teachers'
import { Types } from 'mongoose';

export interface IFormattedClass {
  id: string
  name: string
  code: string
  grade: string
  testParameters: IFormattedTestParameters
  students: IFormattedStudent[]
}

export class FormattedClass {
  public model: IClassModel
  public formatted: IFormattedClass

  constructor(cls: IClassModel) {
    this.model = cls
  }

  public formatClass = async () => {
    const cls = this.model
    const testParameters = await getTestParametersForClass(cls)
    const students = await getStudentsByClass(cls)

    this.formatted = {
      id: cls._id.toString(),
      name: cls.name,
      code: cls.classCode,
      grade: cls.grade,
      testParameters: testParameters.formatted,
      students: students.map((student) => student.formatted),
    }
  }
}

export const getClassFromID = async (classID: string): Promise<FormattedClass> => {
  const cls = await Class.findById(classID).exec()
  const formattedClass = new FormattedClass(cls)
  await formattedClass.formatClass()
  return formattedClass
}

export const getClassesFromTeacher = async (teacher: ITeacherModel): Promise<FormattedClass[]> => {
  const classes = await Class.find({ _id: { $in: teacher.classIDs } }).exec()
  if (classes === null) {
    return []
  }
  return Promise.all(classes.map(async (cls) => {
    const formattedClass = new FormattedClass(cls)
    await formattedClass.formatClass()
    return formattedClass
  }))
}

export const createClass = async (grade: string, name: string): Promise<FormattedClass> => {
  const newClass = await new Class({
    grade,
    name,
    studentIDs: [],
    classCode: generate()
  }).save()
  await createTestParametersForNewClass(newClass._id)
  const formattedClass = new FormattedClass(newClass)
  await formattedClass.formatClass()
  return formattedClass
}

export const addClassToTeacher = async (cls: IClassModel, teacher: ITeacherModel): Promise<FormattedTeacher> => {
  const classes = await getClassesFromTeacher(teacher)

  if (classes.some((c) => c.model._id === cls.id)) {
    throw new Error(`Teacher already has a class with an _id of ${cls._id}`)
  }

  if (classes.some((c) => c.model.name === cls.name)) {
    throw new Error(`Teacher already has a class with a name of ${cls.name}`)
  }

  teacher.classIDs.push(cls._id)
  teacher.save()
  return new FormattedTeacher(teacher)
}

export const removeClassFromTeacher = async (classID: string, teacher: ITeacherModel): Promise<IClassModel> => {
  if (!teacher.classIDs.some((id) => id.equals(classID))) {
    throw new Error('Unable to remove class. Invalid permission.')
  }
  await removeTestParametersFromClass(classID)
  teacher.classIDs = teacher.classIDs.filter((id) => id.toString() !== classID)
  await teacher.save()
  return await removeClassByID(classID)
}

export const removeClassByID = (classID: string): Promise<IClassModel> => {
  return Class.findByIdAndRemove(classID).exec()
}

export const updateClass = async (classID: string, updates: IFormattedClass): Promise<FormattedClass> => {
  const cls = await Class.findOneAndUpdate({ _id: classID }, updates).exec()
  const formattedClass = new FormattedClass(cls)
  await formattedClass.formatClass()
  return formattedClass
}




/*
export const createClass = async (classParams: IClass, userID: string): Promise<IClassModel> => {
  console.log('Creating a new class', classParams, userID)

  const { grade, name } = classParams

  const teacher = await getTeacherFromUserID(userID)

  

  try {
    await addClassToTeacher(newClass, teacher._id)

  } catch(error) {
    Class.findByIdAndRemove(newClass._id).exec()

    throw error
  }

  await addTestParametersToClass(newClass._id)

  return newClass
}

export const updateClass = async (classID: string, updates: IClass, userID: string): Promise<IClassModel> => {
  console.log('Updating class', updates, userID)

  const { grade, name } = updates

  const teacher = await getTeacherFromUserID(userID)
  
  const cls = await getClassByID(classID)

  const classes = await getClassesByTeacherID(teacher._id)

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

  const teacher = await getTeacherFromUserID(userID)

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
  const { _id } = await getTeacherFromUserID(userID)

  return await getClassesByTeacherID(_id)
}

export const getClassesByStudentID = async (studentID: Types.ObjectId): Promise<IClassModel[]> => {
  console.log('Getting classes by student id', studentID)

  return await Class.find({ studentIDs: studentID }).exec()
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

*/