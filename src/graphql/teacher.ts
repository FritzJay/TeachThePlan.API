import { Teacher } from '../models/teacher.model'
import { getUserByEmailPasswordAndType, createUser } from '../library/users/users'
import { getTeacherByUserID, FormattedTeacher } from '../library/teachers/teachers'
import { getClassesFromTeacher } from '../library/classes/classes'

/* GET TEACHER */
export const getTeacher = async ({ email, password }) => {
  const user = await getUserByEmailPasswordAndType(email, password, 'teacher')
  const teacher = await getTeacherByUserID(user.model._id)
  const classes = await getClassesFromTeacher(teacher.model)
  return {
    ...teacher.formatted,
    classes: classes.map((cls) => cls.formatted),
    user: user.formatted,
  }
}

/* CREATE TEACHER */
export const createTeacher = async ({ email, password }) => {
  const user = await createUser(email, password)
  const teacher = await new Teacher({
    userID: user.model._id,
    displayName: email,
    classIDs: []
  }).save()
    .catch(async (error) => {
      console.log('There was an error while creating the teacher. Removing new user.')
      await user.model.remove()
      throw error
    })
  return {
    ...new FormattedTeacher(teacher).formatted,
    user: user.formatted,
    classes: [],
  }
}
