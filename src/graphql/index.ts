import { buildSchema } from 'graphql'
import { getTeacher, createTeacher } from "./teacher"
import { addClass, updateClass } from "./class"

export const schema = buildSchema(`
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
  },
  type Query {
    getTeacher(email: String!, password: String!): Teacher
  },
  type Mutation {
    createTeacher(email: String!, password: String!): Teacher
  }
`)

export const root = {
  getTeacher,
  createTeacher,
  addClass,
  updateClass,
}