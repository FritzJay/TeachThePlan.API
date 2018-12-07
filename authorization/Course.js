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

export const assertAuthenticatedUserIsAuthorizedToGetCourses = async (courses) => {
  throw new AuthenticationError('You are not allowed to view these courses');
}

export const assertAuthenticatedUserIsAuthorizedToGetCourse = async (authedUser, course, Student, Teacher) => {
  if (authedUser.role.toLowerCase() === 'student') {
    const student = await Student.findOneByUserId(authedUser.userId);
    if (!student.coursesIds.some((id) => id.equals(course._id))) {
      throw new AuthenticationError('You are not allowed to view this course');
    }
    return;
  }
  else if (authedUser.role.toLowerCase() === 'teacher') {
    const teacher = await Teacher.findOneByUserId(authedUser.userId);
    if (!teacher._id.equals(course.teacherId)) {
      throw new AuthenticationError('You are not allowed to view this course');
    }
    return;
  }
  throw new AuthenticationError('You are not allowed to view this course');
}

export const assertClassWithNameDoesNotExist = async (teacherId, name, Course) => {
  const courses = await Course.findManyByNameAndTeacherId(name, teacherId);
  if (courses.length > 0) {
    throw new UserInputError(`A course with the name "${name}" already exists for this teacher`);
  }
}
