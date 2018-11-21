import { ObjectId } from 'mongodb';

import { AuthenticationError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToUpdateStudent = async (authedUser, studentId, Student)  => {
  try {
    return await assertAuthenticatedUserIsAuthorizedToModifyStudent(authedUser, studentId, Student);
  } catch (error) {
    throw new AuthenticationError('You are not authorized to update this student');
  }
}

export const assertAuthenticatedUserIsAuthorizedToRemoveStudent = async (authedUser, studentId, Student)  => {
  try {
    return await assertAuthenticatedUserIsAuthorizedToModifyStudent(authedUser, studentId, Student);
  } catch (error) {
    throw new AuthenticationError('You are not authorized to remove this student');
  }
}

export const assertAuthenticatedUserIsAuthorizedToRemovePendingStudent = async (authedUser, studentId, courseId, Student, Teacher, Course)  => {
  const { changePasswordRequired, userId } = await Student.findOneById(studentId);
  if (changePasswordRequired !== true) {
    throw new AuthenticationError('You are not authorized to remove this student');
  }
  const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
  const course = await Course.findOneById(courseId);
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to remove this student');
  }
  return userId;
}

const assertAuthenticatedUserIsAuthorizedToModifyStudent = async (authedUser, studentId, Student) => {
  const { userId } = await Student.findOneById(studentId);
  if (!userId.equals(authedUser.userId)) {
    throw new AuthenticationError('You are not authorized to modify this student');
  }
}

export const assertChangePasswordIsRequired = async (changePasswordRequired) => {
  if (changePasswordRequired === false || changePasswordRequired === undefined) {
    throw new AuthenticationError('You are not authorized to change passwords');
  }
}