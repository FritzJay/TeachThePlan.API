import { ObjectId } from 'mongodb';

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
  },
};

export default resolvers;
