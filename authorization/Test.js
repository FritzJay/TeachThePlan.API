import { AuthenticationError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToCreateATestForStudent = async (authedUser, studentId, Student) => {
  const student = await Student.findOneById(studentId);
  if (!student.userId.equals(authedUser.userId)) {
    throw new AuthenticationError('You are not authorized to create a test for this student');
  }
  return student;
}

export const assertAuthenticatedUserIsAuthorizedToCreateATestInCourse = async (studentId, courseId, Course) => {
  if (courseId !== undefined) {
    const course = await Course.findOneById(courseId);
    const students = await Course.students(course, { limit: 0 });
    if (!students.some((student) => student._id.equals(studentId))) {
      throw new AuthenticationError('You are not authorized to create a test in this class');
    }
    return course;
  }
}

export const assertAuthenticatedUserIsAuthorizedToGradeTestsForStudent = async (authedUser, studentId, Student) => {
  const student = await Student.findOneById(studentId);
  if (!student.userId.equals(authedUser.userId)) {
    throw new AuthenticationError('You are not authorized to grade tests for this student');
  }
  return student;
}

export const assertAuthenticatedUserIsAuthorizedToGradeTestsInCourse = async (studentId, courseId, Course) => {
  const course = await Course.findOneById(courseId);
  const students = await Course.students(course, { limit: 0 });
  if (!students.some((student) => student._id.equals(studentId))) {
    throw new AuthenticationError('You are not authorized to create a test in this class');
  }
  return course;
}

export const assertTestParametersContainsTestNumber = (testParameters, testNumber) => {
  if (!testParameters.numbers.includes(testNumber)) {
    throw new AuthenticationError(`You are not authorized to create a test for the number "${testNumber}" in this class`);
  }
}

export const assertTestParametersContainOperator = (testParameters, operator) => {
  if (!testParameters.operators.includes(operator)) {
    throw new AuthenticationError(`You are not authorized to create a test for the operator "${operator}" in this class`);
  }
}

export const assertTestResultsDoNotExist = async (testId, TestResults) => {
  const testResults = await TestResults.findOneByTestId(testId);
  if (testResults !== null) {
    throw new AuthenticationError('This test has already been graded')
  }
}