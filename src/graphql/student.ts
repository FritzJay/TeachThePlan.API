import { getUserByEmailPasswordAndType, createUser } from "../library/users/users"
import { Student } from "../models/student.model"
import { FormattedStudent, getStudentFromUserID } from "../library/students/students";
import { getClassesFromStudent } from "../library/classes/classes";

/* GET STUDENT */
export const signInStudent = async (rootValue, { email, password }) => {
  const user = await getUserByEmailPasswordAndType(email, password, 'student')
  const student = await getStudentFromUserID(user.model._id)
  const classes = await getClassesFromStudent(student.model)
  return {
    ...student.formatted,
    classes: classes.map((cls) => cls.formatted),
    user: user.formatted,
  }
}

/* SIGN UP STUDENT */
export const signUpStudent = async (rootValue, { email, password }) => {
  const user = await createUser(email, password, ['student'])
  let student
  try {
    student = await new Student({
      userID: user.model._id,
      displayName: email,
      classIDs: []
    }).save()
  } catch (error) {
    console.log('There was an error while creating the student. Removing new user.')
    await user.model.remove()
    throw error
  }
  return {
    ...new FormattedStudent(student).formatted,
    user: user.formatted,
    classes: [],
  }
}