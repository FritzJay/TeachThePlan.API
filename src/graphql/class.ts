import { createClass, addClassToTeacher, IFormattedClass, getClassesFromTeacher, removeClassFromTeacher } from "../library/classes/classes"
import { getTeacherFromToken } from "../library/teachers/teachers"

/* ADD CLASS */
export const addClass = async ({ token, grade, name }: { token: string, grade: string, name: string }) => {
  const teacher = await getTeacherFromToken(token)
  const newClass = await createClass(grade, name)
  await addClassToTeacher(newClass.model, teacher.model)
    .catch(async (error) => {
      await newClass.model.remove()
      throw error
    })
  return newClass.formatted
}

/* UPDATE CLASS */
export const updateClass = ({ token, updates }: { token: string, updates: IFormattedClass }) => {
  return
}

/* REMOVE CLASS */
export const removeClass = async ({ token, id }: { token: string, id: string }) => {
  const teacher = await getTeacherFromToken(token)
  const cls = await removeClassFromTeacher(id, teacher.model)
  return cls._id.toString()
}