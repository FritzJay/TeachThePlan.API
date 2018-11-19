import { assertUserWithEmailDoesNotExist } from '../authorization/User';
import { 
  assertAuthenticatedUserIsAuthorizedToUpdateTeacher,
  assertAuthenticatedUserIsAuthorizedToRemoveTeacher,
} from '../authorization/Teacher';

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
    teachers(root, { lastCreatedAt, limit }, { Teacher }) {
      return Teacher.all({ lastCreatedAt, limit });
    },

    teacher(root, { id }, { authedUser, Teacher }) {
      if (id === undefined) {
        return Teacher.findOneByUserId(authedUser.userId)
      }
      return Teacher.findOneById(id);
    },
  },
  Mutation: {
    async createTeacher(root, { input }, { Teacher, User }) {
      const { user: userInput, ...teacherInput } = input;
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

    async removeTeacher(root, { id: teacherId }, { authedUser, Teacher, User }) {
      const userId = await assertAuthenticatedUserIsAuthorizedToRemoveTeacher(authedUser, teacherId, Teacher)
      const userRemoved = await User.removeById(userId);
      const teacherRemoved = await Teacher.removeById(teacherId);
      return userRemoved && teacherRemoved;
    },
  },
};

export default resolvers;
