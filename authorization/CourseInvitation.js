import { AuthenticationError, UserInputError } from "apollo-server-express";

import { assertStudentIsNotPartOfTheClass } from '../authorization/Student';

export const assertAuthenticatedUserIsAuthorizedToUpdateCourseInvitation = async (teacherId, course)  => {
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to update this course');
  }
}

export const assertAuthenticatedUserIsAuthorizedToGetCourseInvitation = async (authedUser, courseInvitation, Student, Teacher) => {
  if (authedUser.role.toLowerCase() === 'student') {
    const student = await Student.findOneByUserId(authedUser.userId);
    if (!courseInvitation.studentId.equals(student._id)) {
      throw new AuthenticationError('You are not authorized to get this course invitation');
    }
    return;
  }
  else if (authedUser.role.toLowerCase() === 'teacher') {
    const teacher = await Teacher.findOneByUserId(authedUser.userId);
    const classes = await Teacher.courses(teacher, { limit: 0 });
    if (!classes.some(({ _id }) => courseInvitation.courseId.equals(_id))) {
      throw new AuthenticationError('You are not authorized to get this course invitation');
    }
    return;
  }
  throw new AuthenticationError('You are not authorized to get this course invitation');
}

export const assertAuthenticatedUserIsAuthorizedToGetCourseInvitations = async (authedUser, courseInvitations) => {
  throw new AuthenticationError('You are not authorized to get these course invitations');
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

export const assertStudentIsAuthorizedToAcceptCourseInvitation = async (student, courseInvitation) => {
  if (!courseInvitation.studentId.equals(student._id)) {
    throw new AuthenticationError('You are not authorized to accept this course invitation');
  }
  await assertStudentIsNotPartOfTheClass(student, courseInvitation._id)
}

export const assertCourseDoesNotContainInvitation = async (courseId, studentId, CourseInvitation) => {
  if (await CourseInvitation.findOneByCourseIdAndStudentId(courseId, studentId) !== null) {
    throw new UserInputError('The course already contains an invitation for the given student')
  }
}
