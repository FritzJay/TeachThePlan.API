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
