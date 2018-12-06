import { assertUserWithEmailDoesNotExist } from '../authorization/User';
import { 
  assertAuthenticatedUserIsAuthorizedToGetTeacher,
  assertAuthenticatedUserIsAuthorizedToGetTeachers,
  assertAuthenticatedUserIsAuthorizedToUpdateTeacher,
  assertAuthenticatedUserIsAuthorizedToRemoveTeacher,
} from '../authorization/Teacher';
import { UserInputError } from 'apollo-server-core';
import { ObjectId } from 'mongodb';

const resolvers = {
  Teacher: {
    id(teacher) {
      return teacher._id;
    },

    courses(teacher, { lastCreatedAt, limit }, { Teacher }) {
      return Teacher.courses(teacher, { lastCreatedAt, limit });
    },

    user(teacher, args, { Teacher }) {
      return Teacher.user(teacher);
    },
  },
  Query: {
    async teachers(root, { lastCreatedAt, limit }, { authedUser, Teacher }) {
      const teachers = await Teacher.all({ lastCreatedAt, limit });
      await assertAuthenticatedUserIsAuthorizedToGetTeachers(authedUser, teachers);
      return teachers;
    },

    async teacher(root, { id }, { authedUser, Teacher }) {
      if (id === undefined) {
        return Teacher.findOneByUserId(authedUser.userId)
      }
      const teacher = await Teacher.findOneById(id);
      await assertAuthenticatedUserIsAuthorizedToGetTeacher(authedUser, teacher);
      return teacher;
    },
  },
  Mutation: {
    async createTeacher(root, { input }, { Teacher, User }) {
      const { user: userInput, ...teacherInput } = input;
      if (!userInput.email) {
        throw new UserInputError('Email is required');
      }
      await assertUserWithEmailDoesNotExist(userInput.email, User);
      const userId = await User.insert({
        ...userInput,
        role: 'teacher',
      });
      const teacherId = await Teacher.insert({
        userId,
        ...teacherInput,
        name: teacherInput.name || userInput.email,
      });
      return Teacher.findOneById(teacherId);
    },

    async updateTeacher(root, { id: teacherId, input }, { authedUser, Teacher, User }) {
      const userId = await assertAuthenticatedUserIsAuthorizedToUpdateTeacher(authedUser, teacherId, Teacher);
      const { user: userInput, ...teacherInput } = input;
      const user = await User.findOneById(userId);
      if (userInput.email !== user.email) {
        await assertUserWithEmailDoesNotExist(userInput.email, User);
      }
      await User.updateById(userId, userInput);
      await Teacher.updateById(teacherId, teacherInput);
      return Teacher.findOneById(teacherId);
    },

    async removeTeacher(root, { id: teacherId }, { authedUser, Teacher, User, Course, TestParameters, Student, Test, Question, CourseInvitation, CourseRequest }) {
      if (teacherId === undefined) {
        const teacher = await Teacher.findOneByUserId(authedUser.userId);
        teacherId = teacher._id
      }
      await assertAuthenticatedUserIsAuthorizedToRemoveTeacher(authedUser, teacherId, Teacher)
      const courses = await Course.findManyByTeacherId(teacherId)
      await Promise.all(courses.map(async (course) => {
        await TestParameters.removeById(course.testParametersId);
        await Student.removeCourseAssociations(course._id);
        await CourseInvitation.removeByCourseId(course._id);
        await CourseRequest.removeByCourseId(course._id);
        const tests = await Course.tests(course, { limit: 0 });
        await Promise.all(tests.map(async ({ _id }) => {
          await Question.removeByTestId(_id);
          await Test.removeById(_id);
        }));
        await Course.removeById(course._id);
      }));
      const teacherRemoved = await Teacher.removeById(teacherId);
      const userRemoved = await User.removeById(new ObjectId(authedUser.userId));
      return userRemoved && teacherRemoved;
    },
  },
};

export default resolvers;
