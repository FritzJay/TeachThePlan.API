import { buildSchema } from 'graphql'
import { signUpTeacher, signInTeacher } from "./teacher"
import { signInStudent, signUpStudent } from './student'
import { addClass, changeClass, removeClass, getClass } from "./class"
import { getTestParameters, changeTestParameters } from './testParameters'

export const schema = buildSchema(`
  input ClassInput {
    id: String!
    name: String!
    grade: String!
  },
  input TestParametersInput {
    id: String!
    duration: Int!
    numbers: [Int]!
    operators: [String]!
    questions: Int!
    randomQuestions: Int!
  },
  input StudentInput {
    id: String!
    name: String!
  },

  type TeacherUser {
    id: String!
    name: String!
    classes: [Class]!
    user: User!
  },
  type Teacher {
    id: String!
    name: String!
  },
  type StudentUser {
    id: String!
    name: String!
    classes: [Class]!
    user: User!
  },
  type Student {
    id: String!
    name: String!
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
  type TestParameters {
    id: String!
    duration: Int!
    numbers: [Int]!
    operators: [String]!
    questions: Int!
    randomQuestions: Int!
  },
  type Query {
    signInTeacher(email: String!, password: String!): TeacherUser
    signInStudent(email: String!, password: String!): StudentUser
    getClass(token: String!, id: String!): Class
    getTestParameters(token: String!, id: String!): TestParameters
  },
  type Mutation {
    signUpTeacher(email: String!, password: String!): TeacherUser
    signUpStudent(email: String!, password: String!): StudentUser
    addClass(token: String!, grade: String!, name: String!): Class
    changeClass(token: String!, updates: ClassInput!): Class
    removeClass(token: String!, id: String!): String
    changeTestParameters(token: String!, updates: TestParametersInput!): TestParameters
  }
`)

export const root = {
  signInTeacher,
  signUpTeacher,
  signInStudent,
  signUpStudent,
  getClass,
  getTestParameters,
  addClass,
  changeClass,
  removeClass,
  changeTestParameters,
}