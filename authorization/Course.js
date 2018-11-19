import { AuthenticationError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToUpdateCourse = async (teacherId, course)  => {
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to update this course');
  }
}

export const assertAuthenticatedUserIsAuthorizedToRemoveCourse = async (teacherId, course)  => {
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to remove this course');
  }
}

export const assertCourseDoesNotContainInvitation = async (course, studentId) => {
  if (course.invitations && course.invitations.some((id) => id.equals(studentId))) {
    throw new AuthenticationError('This course already contains an invitation for the given student')
  }
}