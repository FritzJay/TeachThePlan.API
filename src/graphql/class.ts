import { createClass, addClassToTeacher, IFormattedClass } from "../library/classes/classes"
import { getTeacherFromToken } from "../library/teachers/teachers"

/* ADD CLASS */
export const addClass = async ({ token, grade, name }) => {
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
export const updateClass = (token: string, updates: IFormattedClass) => {
  return
}