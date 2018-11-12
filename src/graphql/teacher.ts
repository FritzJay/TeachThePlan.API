import { buildSchema } from 'graphql'
import { Teacher } from '../models/teacher.model';
import { comparePasswords, createToken } from '../library/authentication/authentication';
import { User } from '../models/user.model';
import { Class } from '../models/class.model';
import { TestParameters } from '../models/testParameters.model';
import { Student } from '../models/student.model';

interface ITeacherArgs {
  email: string
  password: string
}

export const schema = buildSchema(`
  type Query {
    teacher(email: String!, password: String!): Teacher
  },
  type Teacher {
    id: String!
    name: String!
    classes: [Class]!
    user: User!
  },
  type User {
    email: String!
    token: String!
  },
  type Class {
    id: String!
    name: String!
    code: String!
    grade: String!
    testParameters: TestParameters!
    students: [Student]
  },
  type Student {
    id: String!
    name: String!
  },
  type TestParameters {
    id: String!
    duration: Int!
    numbers: [Int]!
    operators: [String]!
    questions: Int!
    randomQuestions: Int!
  }
`)

const getTeacher = async ({ email, password }: ITeacherArgs) => {
  const user = await User.findOne({ email }).exec()
  const passwordsMatch = await comparePasswords(password, user.password)
  if (!passwordsMatch) {
    throw new Error('Invalid password')
  }
  const token = await createToken(user)
  const formattedUser = formatUser(user, token)

  const teacher = await Teacher.findOne({ userID: user._id }).exec()
  const formattedTeacher = formatTeacher(teacher)

  const classes = await Class.find({ _id: { $in: teacher.classIDs } }).exec()
  const formattedClasses = await formatClasses(classes)

  return {
    ...formattedTeacher,
    classes: formattedClasses,
    user: formattedUser
  }
}

const formatTeacher = ({ _id, displayName }) => ({
  id: _id.toString(),
  name: displayName,
})

const formatUser = ({ email }, token) => ({
  email,
  token,
})

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

export const root = {
  teacher: getTeacher,
}