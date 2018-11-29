import { AuthenticationError, UserInputError } from "apollo-server-express";

export const assertAuthedUserIsAuthorizedToCreateACourseRequest = async (studentId, student) => {
  if (!student._id.equals(studentId)) {
    throw new AuthenticationError('You are not authorized to create a course request for this student');
  }
}

export const assertTeacherIsAuthorizedToRemoveCourseRequest = async (teacherId, courseId, Course) => {
  const course = await Course.findOneById(courseId);
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to remove a course request for this course');
  }
}

export const assertTeacherIsAuthorizedToAcceptCourseRequest = async (teacherId, courseId, Course) => {
  const course = await Course.findOneById(courseId);
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to accept a course request for this course');
  }
}

export const assertStudentIsAuthorizedToRemoveCourseRequest = async (studentId, courseRequest) => {
  if (!courseRequest.studentId.equals(studentId)) {
    throw new AuthenticationError('You are not authorized to remove a course request for this student');
  }
}

export const assertCourseDoesNotContainRequest = async (courseId, studentId, CourseRequest) => {
  const courseRequest = await CourseRequest.findOneByCourseIdAndStudentId(courseId, studentId)
  if (courseRequest !== null) {
    throw new UserInputError('There is already a course request for this student');
  }
}

