import { GraphQLNonNull, GraphQLObjectType, GraphQLList, GraphQLInt, GraphQLString, GraphQLSchema, GraphQLInputObjectType } from 'graphql'
import { GraphQLDateTime } from 'graphql-iso-date'
import { signUpTeacher, signInTeacher } from "./teacher"
import { signInStudent, signUpStudent } from './student'
import { addClass, changeClass, removeClass, getClass } from "./class"
import { getTestParameters, changeTestParameters } from './testParameters'
import { newTest } from './tests';

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    token: { type: new GraphQLNonNull(GraphQLString) },
  }
})

const TeacherType = new GraphQLObjectType({
  name: 'TeacherType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  }
})

const QuestionType = new GraphQLObjectType({
  name: 'Question',
  fields: {
    question: { type: new GraphQLNonNull(GraphQLString) },
    studentAnswer: { type: GraphQLInt },
    correctAnswer: { type: GraphQLInt },
    start: { type: GraphQLDateTime },
    end: { type: GraphQLDateTime },
  }
})

const TestType = new GraphQLObjectType({
  name: 'Test',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    duration: { type: GraphQLNonNull(GraphQLInt) },
    start: { type: GraphQLDateTime },
    end: { type: GraphQLDateTime },
    questions: { type: GraphQLList(QuestionType) }
  }
})

const StudentType = new GraphQLObjectType({
  name: 'Student',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  }
})

const TestParametersType = new GraphQLObjectType({
  name: 'TestParameters',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    duration: { type: new GraphQLNonNull(GraphQLInt) },
    numbers: { type: new GraphQLNonNull(GraphQLList(GraphQLInt)) },
    operators: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
    questions: { type: new GraphQLNonNull(GraphQLInt) },
    randomQuestions: { type: new GraphQLNonNull(GraphQLInt) },
  }
})

const TestParametersInputType = new GraphQLInputObjectType({
  name: 'TestParametersInput',
  description: 'Id, duration, numbers, operators, questions and random questions',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    duration: { type: new GraphQLNonNull(GraphQLInt) },
    numbers: { type: new GraphQLNonNull(GraphQLList(GraphQLInt)) },
    operators: { type: new GraphQLNonNull(GraphQLList(GraphQLString)) },
    questions: { type: new GraphQLNonNull(GraphQLInt) },
    randomQuestions: { type: new GraphQLNonNull(GraphQLInt) },
  }
})

const ClassType = new GraphQLObjectType({
  name: 'Class',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    code: { type: new GraphQLNonNull(GraphQLString) },
    grade: { type: new GraphQLNonNull(GraphQLString) },
    testParameters: { type: new GraphQLNonNull(TestParametersType) },
    students: { type: GraphQLList(StudentType) }
  }
})

const ClassInputType = new GraphQLInputObjectType({
  name: 'ClassInput',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    grade: { type: new GraphQLNonNull(GraphQLString) },
  }
})

const StudentUserType = new GraphQLObjectType({
  name: 'StudentUser',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    classes: { type: new GraphQLNonNull(GraphQLList(ClassType)) },
    user: { type: new GraphQLNonNull(UserType) },
  }
})

const TeacherUserType = new GraphQLObjectType({
  name: 'TeacherUser',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLString) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    classes: { type: new GraphQLNonNull(GraphQLList(ClassType)) },
    user: { type: new GraphQLNonNull(UserType) },
  }
})

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: () => ({
      signInTeacher: {
        type: TeacherUserType,
        resolve: signInTeacher,
        args: {
          email: {
            type: new GraphQLNonNull(GraphQLString),
          },
          password: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      },
      signInStudent: {
        type: StudentUserType,
        resolve: signInStudent,
        args: {
          email: {
            type: new GraphQLNonNull(GraphQLString),
          },
          password: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      },
      getClass: {
        type: ClassType,
        resolve: getClass,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      },
      getTestParameters: {
        type: TestParametersType,
        resolve: getTestParameters,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
      }
    }),
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: () => ({
      signUpTeacher: {
        type: TeacherUserType,
        args: {
          email: {
            type: new GraphQLNonNull(GraphQLString),
          },
          password: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: signUpTeacher,
      },
      signUpStudent: {
        type: StudentUserType,
        args: {
          email: {
            type: new GraphQLNonNull(GraphQLString),
          },
          password: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: signUpStudent,
      },
      addClass: {
        type: ClassType,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          grade: {
            type: new GraphQLNonNull(GraphQLString),
          },
          name: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: addClass,
      },
      changeClass: {
        type: ClassType,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          updates: {
            type: new GraphQLNonNull(ClassInputType)
          },
        },
        resolve: changeClass,
      },
      removeClass: {
        type: GraphQLString,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          id: {
            type: new GraphQLNonNull(GraphQLString),
          },
        },
        resolve: removeClass,
      },
      changeTestParameters: {
        type: TestParametersType,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          updates: {
            type: new GraphQLNonNull(TestParametersInputType)
          }
        },
        resolve: changeTestParameters,
      },
      newTest: {
        type: TestType,
        args: {
          token: {
            type: new GraphQLNonNull(GraphQLString),
          },
          classID: {
            type: new GraphQLNonNull(GraphQLString),
          },
          number: {
            type: new GraphQLNonNull(GraphQLInt),
          },
          operator: {
            type: new GraphQLNonNull(GraphQLString)
          },
        },
        resolve: newTest,
      },
    })
  })
})
