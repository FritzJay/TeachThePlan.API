const resolvers = {
  Parent: {
    id(parent) {
      return parent._id;
    },

    children(parent, { lastCreatedAt, limit }, { Parent }) {
      return Parent.children(parent, { lastCreatedAt, limit });
    },

    user(parent, args, { Parent }) {
      return Parent.user(parent);
    },
  },
  Query: {
    parents(root, { lastCreatedAt, limit }, { Parent }) {
      return Parent.all({ lastCreatedAt, limit });
    },

    parent(root, { id }, { Parent }) {
      return Parent.findOneById(id);
    },
  },
  Mutation: {
    async createParent(root, { input }, { Parent }) {
      const id = await Parent.insert(input);
      return Parent.findOneById(id);
    },

    async updateParent(root, { id, input }, { Parent }) {
      await Parent.updateById(id, input);
      return Parent.findOneById(id);
    },

    removeParent(root, { id }, { Parent }) {
      return Parent.removeById(id);
    },
  },
};

export default resolvers;
