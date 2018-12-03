import { UserInputError, AuthenticationError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToGetUser = async (authedUser, user, Teacher, Student) => {
  if (authedUser.role.toLowerCase() === 'teacher') {
    const teacher = await Teacher.findOneByUserId(authedUser.userId);
    const courses = await Teacher.courses(teacher);
    const student = await Student.findOneByUserId(authedUser.userId);
    const teacherOwnsCourseThatContainsStudentOfUser = !courses.some(course => student.coursesIds.some(id => course._id.equals(id)));
    const teacherOwnsUser = user.userId.equals(teacher.userId);
    if (!teacherOwnsCourseThatContainsStudentOfUser && !teacherOwnsUser) {
      throw new AuthenticationError('You are not authorized to get this user');
    }
    return;
  }
  else if (authedUser.role.toLowerCase() === 'student') {
    const student = await Student.findOneByUserId(authedUser.userId);
    if (!student.userId.equals(user._id)) {
      throw new AuthenticationError('You are not authorized to get this user');
    }
    return;
  }
  throw new AuthenticationError('You are not authorized to get these users');
}

export const assertAuthenticatedUserIsAuthorizedToGetUsers = async (authedUser) => {
  throw new AuthenticationError('You are not authorized to get these users');
}

export const assertAuthenticatedUserIsATeacher = async (authedUser) => {
  if (authedUser.role.toLowerCase() !== 'teacher') {
    throw new AuthenticationError('You are not authorized to generate a unique username');
  }
}

export const assertUserWithEmailDoesNotExist = async (email, User) => {
  if (email === undefined) {
    return
  }
  const user = await User.findOneByEmail(email);
  if (user !== null) {
    throw new UserInputError(`A user with the email "${email}" already exists`);
  }
}

export const assertUserWithUsernameDoesNotExist = async (username, User) => {
  if (username === undefined) {
    return
  }
  const user = await User.findOneByUsername(username);
  if (user !== null) {
    throw new UserInputError(`A user with the username "${username}" already exists`);
  }
}
