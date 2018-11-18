import {
  assertAuthenticatedUserIsAuthorizedToCreateATestForStudent,
  assertAuthenticatedUserIsAuthorizedToCreateATestInCourse,
  assertAuthenticatedUserIsAuthorizedToGradeTestsForStudent,
  assertAuthenticatedUserIsAuthorizedToGradeTestsInCourse,
  assertTestParametersContainsTestNumber,
  assertTestParametersContainOperator,
  assertTestResultsDoNotExist,
} from '../authorization/Test';

const resolvers = {
  Test: {
    id(test) {
      return test._id;
    },

    questions(test, args, { Test }) {
      return Test.questions(test);
    },

    student(test, args, { Test }) {
      return Test.student(test);
    },

    course(test, args, { Test }) {
      return Test.course(test);
    },

    testResults(test, args, { Test }) {
      return Test.testResults(test)
    },
  },
  Query: {
    tests(root, { lastCreatedAt, limit }, { Test }) {
      return Test.all({ lastCreatedAt, limit });
    },

    test(root, { id }, { Test }) {
      return Test.findOneById(id);
    },
  },
  Mutation: {
    async createTest(root, { input }, { authedUser, Test, Student, Course }) {
      const { studentId, courseId, number, operator } = input;
      await assertAuthenticatedUserIsAuthorizedToCreateATestForStudent(authedUser, studentId, Student);
      const course = await assertAuthenticatedUserIsAuthorizedToCreateATestInCourse(studentId, courseId, Course);
      const testParameters = await Course.testParameters(course);
      assertTestParametersContainsTestNumber(testParameters, number);
      assertTestParametersContainOperator(testParameters, operator)
      const { duration, questions, randomQuestions } = testParameters
      const id = await Test.insert({
        ...input,
        duration,
        questions,
        randomQuestions,
      });
      return Test.findOneById(id);
    },

    async gradeTest(root, { id, input }, { authedUser, Test, Student, Course, TestResults }) {
      const { studentId, courseId } = await Test.findOneById(id);
      await assertTestResultsDoNotExist(id, TestResults);
      await assertAuthenticatedUserIsAuthorizedToGradeTestsForStudent(authedUser, studentId, Student);
      await assertAuthenticatedUserIsAuthorizedToGradeTestsInCourse(studentId, courseId, Course);
      return await Test.grade(id, input);
    },

    removeTest(root, { id }, { Test }) {
      return Test.removeById(id);
    },
  },
};

export default resolvers;
