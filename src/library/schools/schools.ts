import { School, ISchoolModel } from '../../models/school.model'
import { ITeacherModel } from '../../models/teacher.model'
import { Types } from 'mongoose'
import { rejects } from 'assert'
import { resolve } from 'path'

export interface ISchool {
  name: string,
  teacherIDs?: Types.ObjectId[],
}

export const createSchool = (schoolParams: ISchool): Promise<ISchoolModel> => {
  return new Promise((resolve, reject) => {
    const school = new School({
      name: schoolParams.name,
      teachers: schoolParams.teacherIDs,
    })
    school.save()
    .then((school) => {
      resolve(school)
    })
    .catch((error) => {
      reject(error)
    })
  })
}

export const getSchoolByName = (name: string): Promise<ISchoolModel> => {
  return new Promise((resolve, reject) => {
    School.findOne({name: name})
    .exec()
    .then((school: ISchoolModel) => {
      if (school) {
        resolve(school)
      } else {
        reject(new Error('Unable to find school'))
      }
    })
  })
}

export const addTeacherToSchool = (teacher: ITeacherModel, schoolName: string): Promise<ISchoolModel> => {
  return new Promise((resolve, reject) => {
    getSchoolByName(schoolName)
    .then((school: ISchoolModel) => {
      school.teacherIDs.push(teacher._id)
      school.save()
      .then((school: ISchoolModel) => {
        resolve(school)
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

export const removeSchoolByName = (schoolName: string): Promise<ISchoolModel> => {
  return new Promise((resolve, reject) => {
    getSchoolByName(schoolName)
    .then((school: ISchoolModel) => {
      school.remove()
      .then((school: ISchoolModel) => {
        resolve(school)
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