import { Teacher } from '../models/teacher.model';
import { Class } from '../models/class.model';
import { TestParameters } from '../models/testParameters.model';
import { Student } from '../models/student.model';
import { getUserByEmailPasswordAndType, createUser } from '../library/users/users';
import { getTeacherByUserID, FormattedTeacher } from '../library/teachers/teachers';

/* GET TEACHER */
export const getTeacher = async ({ email, password }) => {
  const user = await getUserByEmailPasswordAndType(email, password, 'teacher')
  const teacher = await getTeacherByUserID(user.model._id)

  const classes = await Class.find({ _id: { $in: teacher.model.classIDs } }).exec()
  const formattedClasses = await formatClasses(classes)

  const response = {
    ...teacher.formatted,
    classes: formattedClasses,
    user: user.formatted
  }

  return response
}

const formatClasses = async (classes) => {
  return await classes.map(async (cls) => {
    const testParameters = await TestParameters.findOne({ objectID: cls._id }).exec()
    const formattedTestParameters = formatTestParameters(testParameters)

    const students = await Student.find({ _id: { $in: cls.studentIDs } }).exec()
    const formattedStudents = formatStudents(students)

    return {
      id: cls._id.toString(),
      name: cls.name,
      code: cls.classCode,
      grade: cls.grade,
      testParameters: formattedTestParameters,
      students: formattedStudents,
    }
  })
}

const formatTestParameters = ({ _id, duration, numbers, operators, questions, randomQuestions }) => ({
  id: _id.toString(),
  duration,
  numbers,
  operators,
  questions,
  randomQuestions,
})

const formatStudents = (students) => (
  students.map(({ _id, displayName }) => ({
    id: _id.toString(),
    name: displayName,
  }))
)

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
