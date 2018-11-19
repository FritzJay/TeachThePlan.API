import {
  AuthenticationError,
  UserInputError,
} from "apollo-server-express";

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

export const assertClassWithNameDoesNotExist = async (teacherId, name, Course) => {
  const courses = await Course.findManyByNameAndTeacherId(name, teacherId);
  if (courses.length > 0) {
    throw new UserInputError(`A course with the name "${name}" already exists for this teacher`)
  }
}
