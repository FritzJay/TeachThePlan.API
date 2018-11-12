import { Teacher, ITeacherModel } from '../../models/teacher.model'
import { getUserIDFromToken } from '../authentication/authentication'

interface IFormattedTeacher {
  id: string
  name: string
}

export class FormattedTeacher {
  public model: ITeacherModel
  public formatted: IFormattedTeacher

  constructor(teacher: ITeacherModel) {
    this.model = teacher
    this.formatted = this.formatTeacher(teacher)
  }

  private formatTeacher = ({ _id, displayName }) => {
    return {
      id: _id.toString(),
      name: displayName,
    }
  }
}

export const getTeacherFromUserID = async (userID: string): Promise<FormattedTeacher> => {
  const teacher = await Teacher.findOne({ userID }).exec()
  return new FormattedTeacher(teacher)
}

export const getTeacherFromToken = async (token: string): Promise<FormattedTeacher> => {
  const userID = await getUserIDFromToken(token)
  return getTeacherFromUserID(userID)
}


/*
export const getTeacherByID = async (teacherID: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by teacherID', teacherID)

  return Teacher.findById(teacherID).exec()
}

export const addClassToTeacher = async (newClass: IClassModel, teacherID: string): Promise<ITeacherModel> => {
  console.log('Adding class to teacher', newClass, teacherID)

  const teacher = await getTeacherByID(teacherID)
}
*/