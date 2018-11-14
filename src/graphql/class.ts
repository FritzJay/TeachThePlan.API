import { createClass, addClassToTeacher, IFormattedClass, removeClassFromTeacher, updateClass, getClassFromID } from "../library/classes/classes"
import { getTeacherFromToken } from "../library/teachers/teachers"

/* ADD CLASS */
export const addClass = async (rootValue, { token, grade, name }: { token: string, grade: string, name: string }): Promise<IFormattedClass> => {
  const teacher = await getTeacherFromToken(token)
  const newClass = await createClass(grade, name)
  await addClassToTeacher(newClass.model, teacher.model)
    .catch(async (error) => {
      await newClass.model.remove()
      throw error
    })
  return newClass.formatted
}

/* GET CLASS */
export const getClass = async (rootValue, {token, id}: { token: string, id: string}): Promise<IFormattedClass> => {
  const teacher = await getTeacherFromToken(token)
  if (!teacher.model.classIDs.some((_id) => _id.equals(id))) {
    throw new Error('You are not authorized to update this class')
  }
  const cls = await getClassFromID(id)
  if (cls === null) {
    throw new Error('Unable to find class')
  }
  return cls.formatted
}

/* UPDATE CLASS */
export const changeClass = async (rootValue, { token, updates }: { token: string, updates: IFormattedClass }): Promise<IFormattedClass> => {
  const teacher = await getTeacherFromToken(token)
  if (!teacher.model.classIDs.some((_id) => _id.equals(updates.id))) {
    throw new Error('You are not authorized to update this class')
  }
  const cls = await updateClass(updates.id, updates)
  return cls.formatted
}

/* REMOVE CLASS */
export const removeClass = async (rootValue, { token, id }: { token: string, id: string }): Promise<string> => {
  const teacher = await getTeacherFromToken(token)
  const cls = await removeClassFromTeacher(id, teacher.model)
  return cls._id.toString()
}