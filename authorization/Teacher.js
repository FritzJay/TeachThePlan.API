import { AuthenticationError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToGetTeacher = async (authedUser, teacher) => {
  if (!teacher.userId.equals(authedUser.userId)) {
    throw new AuthenticationError('You are not authorized to get this teacher');
  }
}

export const assertAuthenticatedUserIsAuthorizedToGetTeachers = async (authedUser, teachers) => {
  throw new AuthenticationError('You are not authorized to get these teachers');
}

export const assertAuthenticatedUserIsAuthorizedToUpdateTeacher = async (authedUser, teacherId, Teacher)  => {
  try {
    return await assertAuthenticatedUserIsAuthorizedToModifyTeacher(authedUser, teacherId, Teacher);
  } catch (error) {
    throw new AuthenticationError('You are not authorized to update this teacher');
  }
}

export const assertAuthenticatedUserIsAuthorizedToRemoveTeacher = async (authedUser, teacherId, Teacher)  => {
  try {
    return await assertAuthenticatedUserIsAuthorizedToModifyTeacher(authedUser, teacherId, Teacher);
  } catch (error) {
    throw new AuthenticationError('You are not authorized to remove this teacher');
  }
}

const assertAuthenticatedUserIsAuthorizedToModifyTeacher = async (authedUser, teacherId, Teacher) => {
  const { userId } = await Teacher.findOneById(teacherId);
  if (!userId.equals(authedUser.userId)) {
    throw new AuthenticationError('You are not authorized to modify this teacher');
  }
}