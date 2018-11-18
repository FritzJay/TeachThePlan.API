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

    user(root, { id }, { User }) {
      return User.findOneById(id);
    },
  },
};

export default resolvers;
