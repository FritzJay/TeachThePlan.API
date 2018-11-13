import { buildSchema } from 'graphql'
import { createTeacher, signInTeacher } from "./teacher"
import { addClass, changeClass, removeClass, getClass } from "./class"
import { getTestParameters, changeTestParameters } from './testParameters'
import { signInStudent } from './student'

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

  type SignInTeacher {
    id: String!
    name: String!
    classes: [Class]!
    user: User!
  },
  type Teacher {
    id: String!
    name: String!
  },
  type SignInStudent {
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
    signInTeacher(email: String!, password: String!): SignInTeacher
    signInStudent(email: String!, password: String!): SignInStudent
    getClass(token: String!, id: String!): Class
    getTestParameters(token: String!, id: String!): TestParameters
  },
  type Mutation {
    createTeacher(email: String!, password: String!): Teacher
    addClass(token: String!, grade: String!, name: String!): Class
    changeClass(token: String!, updates: ClassInput!): Class
    removeClass(token: String!, id: String!): String
    changeTestParameters(token: String!, updates: TestParametersInput!): TestParameters
  }
`)

export const root = {
  signInTeacher,
  signInStudent,
  getClass,
  getTestParameters,
  createTeacher,
  addClass,
  changeClass,
  removeClass,
  changeTestParameters,
}