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