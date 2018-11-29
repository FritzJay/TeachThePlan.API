import { AuthenticationError, UserInputError } from "apollo-server-express";

export const assertAuthedUserIsAuthorizedToGetCourseRequests = async (authedUser, CourseRequest, Course) => {
  throw new AuthenticationError('You are not authorized to get these course requests');
}

export const assertAuthedUserIsAuthorizedToGetCourseRequest = async (authedUser, courseRequest, Teacher, Student) => {
  if (authedUser.role.toLowerCase() === 'teacher') {
    const teacher = await Teacher.findOneByUserId(authedUser.userId);
    const courses = await Teacher.courses(teacher, { limit: 0 });
    if (!courses.some((course) => course._id.equals(courseRequest.courseId))) {
      throw new AuthenticationError('You are not authorized to get the course request');
    }
    return;
  }
  else if (authedUser.role.toLowerCase() === 'student') {
    const student = await Student.findOneByUserId(authedUser.userId);
    if (!student._id.equals(courseRequest.studentId)) {
      throw new AuthenticationError('You are not authorized to get the course request')
    }
    return;
  }
  throw new AuthenticationError('You are not authorized to get the course request')
}

export const assertAuthedUserIsAuthorizedToCreateACourseRequest = async (studentId, student) => {
  if (!student._id.equals(studentId)) {
    throw new AuthenticationError('You are not authorized to create a course request for this student');
  }
}

export const assertTeacherIsAuthorizedToRemoveCourseRequest = async (teacherId, courseId, Course) => {
  const course = await Course.findOneById(courseId);
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to remove a course request for this course');
  }
}

export const assertTeacherIsAuthorizedToAcceptCourseRequest = async (teacherId, courseId, Course) => {
  const course = await Course.findOneById(courseId);
  if (!course.teacherId.equals(teacherId)) {
    throw new AuthenticationError('You are not authorized to accept a course request for this course');
  }
}

export const assertStudentIsAuthorizedToRemoveCourseRequest = async (studentId, courseRequest) => {
  if (!courseRequest.studentId.equals(studentId)) {
    throw new AuthenticationError('You are not authorized to remove a course request for this student');
  }
}

export const assertCourseDoesNotContainRequest = async (courseId, studentId, CourseRequest) => {
  const courseRequest = await CourseRequest.findOneByCourseIdAndStudentId(courseId, studentId)
  if (courseRequest !== null) {
    throw new UserInputError('There is already a course request for this student');
  }
}

