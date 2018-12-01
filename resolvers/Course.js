import { generate } from 'shortid';

import {
  assertAuthenticatedUserIsAuthorizedToGetCourse,
  assertAuthenticatedUserIsAuthorizedToGetCourses,
  assertAuthenticatedUserIsAuthorizedToUpdateCourse,
  assertAuthenticatedUserIsAuthorizedToRemoveCourse,
  assertClassWithNameDoesNotExist,
} from '../authorization/Course';

import { assertDocumentExists } from '../authorization';

const resolvers = {
  Course: {
    id(course) {
      return course._id;
    },

    students(course, { lastCreatedAt, limit }, { Course }) {
      return Course.students(course, { lastCreatedAt, limit });
    },

    teacher(course, args, { Course }) {
      return Course.teacher(course);
    },

    testParameters(course, args, { Course }) {
      return Course.testParameters(course);
    },

    courseInvitations(course, { lastCreatedAt, limit }, { Course }) {
      return Course.courseInvitations(course, { lastCreatedAt, limit })
    },

    courseRequests(course, { lastCreatedAt, limit }, { Course }) {
      return Course.courseRequests(course, { lastCreatedAt, limit })
    },
  },
  Query: {
    async courses(root, { lastCreatedAt, limit }, { Course }) {
      const courses = await Course.all({ lastCreatedAt, limit });
      // No one is allowed to view all courses at the moment
      await assertAuthenticatedUserIsAuthorizedToGetCourses(courses);
      return courses;
    },

    async course(root, { id }, { authedUser, Course, Student, Teacher }) {
      const course = await Course.findOneById(id);
      await assertAuthenticatedUserIsAuthorizedToGetCourse(authedUser, course, Student, Teacher);
      return course;
    },
  },
  Mutation: {
    async createCourse(root, { input }, { authedUser, Course, Teacher, TestParameters }) {
      const teacher = await Teacher.findOneByUserId(authedUser.userId);
      await assertDocumentExists(teacher, 'teacher');
      await assertClassWithNameDoesNotExist(teacher._id, input.name, Course);
      const testParametersId = await TestParameters.insert(TestParameters.defaultTestParameters());
      const courseId = await Course.insert({
        ...input,
        code: generate(),
        teacherId: teacher._id,
        testParametersId,
      });
      return Course.findOneById(courseId);
    },

    async updateCourse(root, { id: courseId, input }, { authedUser, Course, Teacher }) {
      const teacher = await Teacher.findOneByUserId(authedUser.userId);
      await assertDocumentExists(teacher, 'teacher');
      const course = await Course.findOneById(courseId);
      await assertAuthenticatedUserIsAuthorizedToUpdateCourse(teacher._id, course);
      if (input.name !== undefined && input.name.toLowerCase() !== course.name.toLowerCase()) {
        await assertClassWithNameDoesNotExist(teacher._id, input.name, Course);
      }
      await Course.updateById(courseId, input);
      return Course.findOneById(courseId);
    },

    async removeCourse(root, { id: courseId }, { authedUser, Course, Teacher, TestParameters, Student, CourseInvitation, CourseRequest }) {
      const teacher = await Teacher.findOneByUserId(authedUser.userId);
      await assertDocumentExists(teacher, 'teacher');
      const course = await Course.findOneById(courseId);
      await assertAuthenticatedUserIsAuthorizedToRemoveCourse(teacher._id, course);
      const testParametersRemoved = await TestParameters.removeById(course.testParametersId);
      const courseRemoved = await Course.removeById(courseId);
      const studentAssociationsRemoved = await Student.removeCourseAssociations(courseId);
      const courseInvitationsRemoved = await CourseInvitation.removeByCourseId(courseId);
      const courseRequestsRemoved = await CourseRequest.removeByCourseId(courseId);
      return testParametersRemoved && courseRemoved && studentAssociationsRemoved && courseInvitationsRemoved && courseRequestsRemoved;
    },
  }
};

export default resolvers;
