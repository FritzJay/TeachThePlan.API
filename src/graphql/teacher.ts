import { Teacher } from '../models/teacher.model'
import { getUserByEmailPasswordAndType, createUser } from '../library/users/users'
import { getTeacherFromUserID, FormattedTeacher } from '../library/teachers/teachers'
import { getClassesFromTeacher } from '../library/classes/classes'

/* GET TEACHER */
export const signInTeacher = async (rootValue, { email, password }) => {
  const user = await getUserByEmailPasswordAndType(email, password, 'teacher')
  const teacher = await getTeacherFromUserID(user.model._id)
  const classes = await getClassesFromTeacher(teacher.model)
  return {
    ...teacher.formatted,
    classes: classes.map((cls) => cls.formatted),
    user: user.formatted,
  }
}

/* SIGN UP TEACHER */
export const signUpTeacher = async (rootValue, { email, password }) => {
  const user = await createUser(email, password, ['teacher'])
  let teacher
  try {
    teacher = await new Teacher({
      userID: user.model._id,
      displayName: email,
      classIDs: []
    }).save()
  } catch (error) {
    console.log('There was an error while creating the teacher. Removing new user.')
    await user.model.remove()
    throw error
  }
  return {
    ...new FormattedTeacher(teacher).formatted,
    user: user.formatted,
    classes: [],
  }
}
