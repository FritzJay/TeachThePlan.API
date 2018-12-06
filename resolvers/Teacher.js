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

    async removeTeacher(root, { id: teacherId }, { authedUser, Teacher, User, Course, TestParameters, Student, Test, CourseInvitation, CourseRequest }) {
      await assertAuthenticatedUserIsAuthorizedToRemoveTeacher(authedUser, teacherId, Teacher)
      const userRemoved = await User.removeById(new ObjectId(authedUser.userId));
      const teacherRemoved = await Teacher.removeById(teacherId);
      const courses = await Course.findManyByTeacherId(teacherId)
      await Promise.all(courses.map(async ({ _id, testParametersId }) => {
        await TestParameters.removeById(testParametersId);
        await Student.removeCourseAssociations(_id);
        await Test.removeByCourseId(_id);
        await CourseInvitation.removeByCourseId(_id);
        await CourseRequest.removeByCourseId(_id);
        await Course.removeById(_id);
      }));
      return userRemoved && teacherRemoved;
    },
  },
};

export default resolvers;
