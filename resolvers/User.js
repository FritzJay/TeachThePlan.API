import { ObjectId } from 'mongodb';
import { createUniqueUsernameForNewStudent } from '../src/library/user';

const resolvers = {
  User: {
    id(user) {
      return user._id;
    },
  },
  Query: {
    users(root, { lastCreatedAt, limit }, { User }) {
      return User.all({ lastCreatedAt, limit });
    },

    user(root, { id }, { authedUser, User }) {
      const userId = id || authedUser.userId
      return User.findOneById(new ObjectId(userId));
    },

    async uniqueUserName(root, { firstName, lastName, courseName }, { User }) {
      return await createUniqueUsernameForNewStudent(firstName, lastName, courseName, User);
    }
  },
};

export default resolvers;
