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
    async createTest(root, { input }, { authedUser, Test, Student, Course, TestParameters }) {
      const { studentId, courseId, number, operator } = input;
      await assertAuthenticatedUserIsAuthorizedToCreateATestForStudent(authedUser, studentId, Student);
      const course = await assertAuthenticatedUserIsAuthorizedToCreateATestInCourse(studentId, courseId, Course);
      const testParameters = course
        ? await Course.testParameters(course)
        : TestParameters.defaultTestParameters(studentId);
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
      const test = await Test.findOneById(id);
      const { studentId, courseId } = test
      await assertTestResultsDoNotExist(id, TestResults);
      await assertAuthenticatedUserIsAuthorizedToGradeTestsForStudent(authedUser, studentId, Student);
      await assertAuthenticatedUserIsAuthorizedToGradeTestsInCourse(studentId, courseId, Course);
      const course = await Course.findOneById(courseId);
      const { passing } = await Course.testParameters(course)
      return await Test.grade(id, input, passing);
    },

    removeTest(root, { id }, { Test }) {
      return Test.removeById(id);
    },
  },
};

export default resolvers;
