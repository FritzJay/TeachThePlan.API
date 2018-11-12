import { buildSchema } from 'graphql'
import { Teacher } from '../models/teacher.model';

interface ITeacherArgs {
  email: string
  password: string
}

export default buildSchema(`
  type Query {
    teacher(email: String!, password: String!): Teacher
  },
  type Teacher {
    id: String
    name: String!
    grade: String!
    classes: [Class]!
  },
  type Class {
    id: String
    name: String!
    code: String!
    grade: String!
    testParameters: TestParameters!
    students: [Student]!
  },
  type Student {
    id: String
    name: String!
  }
`)

const getTeacher = ({ email, password }: ITeacherArgs) => {
  Teacher.findOne({  })
}