import { ObjectId } from 'mongodb';
import { createUniqueUsernameForNewStudent } from '../src/library/user';
import {
  assertAuthenticatedUserIsATeacher,
  assertAuthenticatedUserIsAuthorizedToGetUser,
  assertAuthenticatedUserIsAuthorizedToGetUsers,
} from '../authorization/User';

const resolvers = {
  User: {
    id(user) {
      return user._id;
    },
  },
  Query: {
    async users(root, { lastCreatedAt, limit }, { authedUser, User }) {
      await assertAuthenticatedUserIsAuthorizedToGetUsers(authedUser);
      return User.all({ lastCreatedAt, limit });
    },

    async user(root, { id }, { authedUser, User, Teacher, Student }) {
      if (id !== undefined) {
        const user = await User.findOneById(id);
        await assertAuthenticatedUserIsAuthorizedToGetUser(authedUser, user, Teacher, Student);
        return user;
      }
      return User.findOneById(new ObjectId(authedUser.userId))
    },

    async uniqueUserName(root, { firstName, lastName, courseName }, { authedUser, User }) {
      await assertAuthenticatedUserIsATeacher(authedUser);
      return await createUniqueUsernameForNewStudent(firstName, lastName, courseName, User);
    }
  },
};

export default resolvers;
