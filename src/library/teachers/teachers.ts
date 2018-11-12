import { Teacher, ITeacherModel } from '../../models/teacher.model'

interface IFormattedTeacher {
  id: string,
  name: string,
}

export class FormattedTeacher {
  public model: ITeacherModel
  public formatted: IFormattedTeacher

  constructor(teacher: ITeacherModel) {
    this.model = teacher
    this.formatted = this.formatTeacher(teacher)
  }

  private formatTeacher = ({ _id, displayName }) => ({
    id: _id.toString(),
    name: displayName,
  })
}

export const getTeacherByUserID = async (userID: string): Promise<FormattedTeacher> => {
  const teacher = await Teacher.findOne({ userID }).exec()
  return new FormattedTeacher(teacher)
}


/*
export const getTeacherByID = async (teacherID: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by teacherID', teacherID)

  return Teacher.findById(teacherID).exec()
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
*/