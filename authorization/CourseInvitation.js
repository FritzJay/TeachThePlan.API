import { AuthenticationError, UserInputError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToUpdateCourseInvitation = async (teacherId, course)  => {
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to update this course');
  }
}

export const assertTeacherIsAuthorizedToRemoveCourseInvitation = async (teacherId, courseId, Course)  => {
  const course = await Course.findOneById(courseId)
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to remove this course invitation');
  }
}

export const assertStudentIsAuthorizedToRemoveCourseInvitation = async (studentId, courseInvitation)  => {
  if (!courseInvitation.studentId.equals(studentId)) {
    throw new AuthenticationError('You are not authorized to remove this course invitation');
  }
}

export const assertCourseDoesNotContainInvitation = async (courseId, studentId, CourseInvitation) => {
  if (await CourseInvitation.findOneByCourseIdAndStudentId(courseId, studentId) !== null) {
    throw new UserInputError('The course already contains an invitation for the given student')
  }
}