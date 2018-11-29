import {
  assertAuthedUserIsAuthorizedToCreateACourseRequest,
  assertTeacherIsAuthorizedToRemoveCourseRequest,
  assertStudentIsAuthorizedToRemoveCourseRequest,
  assertTeacherIsAuthorizedToAcceptCourseRequest,
  assertStudentIsNotPartOfTheClass,
  assertCourseDoesNotContainRequest,
  assertDocumentExists,
} from '../authorization';

import { AuthenticationError } from 'apollo-server-core';

const resolvers = {
  CourseRequest: {
    id(courseRequest) {
      return courseRequest._id;
    },

    student(courseRequest, args, { CourseRequest }) {
      return CourseRequest.student(courseRequest);
    },

    course(courseRequest, args, { CourseRequest }) {
      return CourseRequest.course(courseRequest);
    }
  },
  Query: {
    courseRequests(root, { lastCreatedAt, limit }, { CourseRequest }) {
      return CourseRequest.all({ lastCreatedAt, limit });
    },

    courseRequest(root, { id }, { CourseRequest }) {
      return CourseRequest.findOneById(id);
    },
  },
  Mutation: {
    async createCourseRequest(root, { input }, { authedUser, Course, CourseRequest, Student }) {
      const { studentId, code } = input
      const { _id: courseId } = await Course.findOneByCode(code);
      const student = await Student.findOneByUserId(authedUser.userId);
      await assertAuthedUserIsAuthorizedToCreateACourseRequest(studentId, student);
      await assertCourseDoesNotContainRequest(courseId, student._id, CourseRequest);
      await assertStudentIsNotPartOfTheClass(student, courseId)
      const courseRequestId = await CourseRequest.insert({ courseId, studentId: studentId });
      return await CourseRequest.findOneById(courseRequestId);
    },

    async removeCourseRequest(root, { id: courseRequestId }, { authedUser, CourseRequest, Teacher, Student, Course }) {
      const courseRequest = await CourseRequest.findOneById(courseRequestId);
      await assertDocumentExists(courseRequest, 'CourseRequest');
      if (authedUser.role === 'teacher') {
        const { _id: teacherId} = await Teacher.findOneByUserId(authedUser.userId);
        await assertTeacherIsAuthorizedToRemoveCourseRequest(teacherId, courseRequest.courseId, Course);
      } else if (authedUser.role === 'student') {
        const { _id: studentId} = await Student.findOneByUserId(authedUser.userId);
        await assertStudentIsAuthorizedToRemoveCourseRequest(studentId, courseRequest);
      } else {
        throw new AuthenticationError('You are not authorized to remove this course request')
      }
      return CourseRequest.removeById(courseRequestId);
    },

    async acceptCourseRequest(root, { id }, { authedUser, CourseRequest, Student, Teacher, Course }) {
      const courseRequest = await CourseRequest.findOneById(id);
      await assertDocumentExists(courseRequest, 'CourseRequest');
      const teacher = await Teacher.findOneByUserId(authedUser.userId);
      await assertTeacherIsAuthorizedToAcceptCourseRequest(teacher._id, courseRequest.courseId, Course);
      const student = await Student.findOneById(courseRequest.studentId);
      await Student.updateById(student._id, {
        ...student,
        coursesIds: student.coursesIds
          ? student.coursesIds.concat([courseRequest.courseId])
          : [courseRequest.courseId]
      })
      await CourseRequest.removeById(id);
      return Course.findOneById(courseRequest.courseId)
    },
  },
};

export default resolvers;
