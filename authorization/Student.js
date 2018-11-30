import { AuthenticationError, UserInputError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToGetStudent = async (authedUser, student, Student, Teacher) => {
  if (authedUser.role.toLowerCase() === 'student') {
    if (!student.userId.equals(authedUser.userId)) {
      throw new AuthenticationError('You are not authorized to view this student');
    }
    return;
  }
  else if (authedUser.role.toLowerCase() === 'teacher') {
    const teacher = await Teacher.findOneByUserId(authedUser.userId);
    const courses = await Student.courses(student, { limit: 0 });
    if (!courses.some((course) => course.teacherId.equals(teacher._id))) {
      throw new AuthenticationError('You are not authorized to view this student');
    }
    return;
  }
  throw new AuthenticationError('You are not authorized to view this student');
}

export const assertAuthenticatedUserIsAuthorizedToGetStudents = async (authedUser, students) => {
  throw new AuthenticationError('You are not authorized to view these students');
}

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

export const assertStudentIsNotPartOfTheClass = async (student, courseId) => {
  if (student.coursesIds && student.coursesIds.some((id) => id.equals(courseId))) {
    throw new UserInputError('The student is already a part of the class');
  }
}

export const assertAuthenticatedUserIsAuthorizedToGetTestForStudent = (authedUser, test, student) => {
  if (!test.studentId.equals(student._id)) {
    throw new AuthenticationError('You are not authorized to get this test for this student')
  }
}