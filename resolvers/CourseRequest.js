import {
  assertAuthedUserIsAuthorizedToGetCourseRequest,
  assertAuthedUserIsAuthorizedToGetCourseRequests,
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
    async courseRequests(root, { lastCreatedAt, limit }, { authedUser, CourseRequest, Course }) {
      const courseRequests = await CourseRequest.all({ lastCreatedAt, limit });
      await assertAuthedUserIsAuthorizedToGetCourseRequests(authedUser, courseRequests, Course);
      return courseRequests;
    },

    async courseRequest(root, { id }, { authedUser, CourseRequest, Teacher, Student }) {
      const courseRequest = await CourseRequest.findOneById(id);
      await assertAuthedUserIsAuthorizedToGetCourseRequest(authedUser, courseRequest, Teacher, Student);
      return courseRequest;
    },
  },
  Mutation: {
    async createCourseRequest(root, { input: { studentId, code } }, { authedUser, Course, CourseRequest, Student }) {
      const course = await Course.findOneByCode(code);
      await assertDocumentExists(course, 'course');
      const student = await Student.findOneByUserId(authedUser.userId);
      await assertAuthedUserIsAuthorizedToCreateACourseRequest(studentId, student);
      await assertCourseDoesNotContainRequest(course._id, student._id, CourseRequest);
      await assertStudentIsNotPartOfTheClass(student, course._id)
      const courseRequestId = await CourseRequest.insert({ courseId: course._id, studentId: studentId });
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
