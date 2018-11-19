import { generate } from 'shortid'

import {
  assertAuthenticatedUserIsAuthorizedToUpdateCourse,
  assertAuthenticatedUserIsAuthorizedToRemoveCourse,
  assertCourseDoesNotContainInvitation,
} from '../authorization/Course'

const resolvers = {
  Course: {
    id(course) {
      return course._id;
    },

    students(course, { lastCreatedAt, limit }, { Course }) {
      return Course.students(course, { lastCreatedAt, limit });
    },

    async teacher(course, args, { Course }) {
      return Course.teacher(course);
    },

    testParameters(course, args, { Course }) {
      return Course.testParameters(course);
    },

    invitations(course, { limit }, { Course }) {
      return Course.invitations(course, { limit })
    }
  },
  Query: {
    courses(root, { lastCreatedAt, limit }, { Course }) {
      return Course.all({ lastCreatedAt, limit });
    },

    course(root, { id }, { Course }) {
      return Course.findOneById(id);
    },
  },
  Mutation: {
    async createCourse(root, { input }, { authedUser, Course, Teacher, TestParameters }) {
      const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
      const testParametersId = await TestParameters.insert({
        duration: 75,
        numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        operators: ['+', '-', '*', '/'],
        questions: 20,
        randomQuestions: 5
      });
      const courseId = await Course.insert({
        ...input,
        code: generate(),
        teacherId,
        testParametersId,
      });
      return Course.findOneById(courseId);
    },

    async updateCourse(root, { id: courseId, input }, { authedUser, Course, Teacher }) {
      const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
      const course = await Course.findOneById(courseId);
      await assertAuthenticatedUserIsAuthorizedToUpdateCourse(teacherId, course);
      await Course.updateById(courseId, input);
      return Course.findOneById(courseId);
    },

    async removeCourse(root, { id: courseId }, { authedUser, Course, Teacher, TestParameters }) {
      const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
      const course = await Course.findOneById(courseId);
      await assertAuthenticatedUserIsAuthorizedToRemoveCourse(teacherId, course);
      const testParametersRemoved = await TestParameters.removeById(course.testParametersId);
      const courseRemoved = await Course.removeById(courseId);
      return testParametersRemoved && courseRemoved;
    },

    async createCourseInvitation(root, { input }, { authedUser, Course, Student, Teacher }) {
      const { courseId, studentId } = input
      const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
      const course = await Course.findOneById(courseId);
      await assertAuthenticatedUserIsAuthorizedToUpdateCourse(teacherId, course);
      await assertCourseDoesNotContainInvitation(course, studentId);
      await Course.updateById(courseId, {
        invitations: course.invitations
          ? course.invitations.concat(studentId)
          : [studentId]
      });
      return await Course.findOneById(courseId);
    }
  },
};

export default resolvers;
