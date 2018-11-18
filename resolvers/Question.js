const resolvers = {
  Question: {
    id(question) {
      return question._id;
    },

    test(question, args, { Question }) {
      return Question.test(question);
    },
  },
  Query: {
    questions(root, { lastCreatedAt, limit }, { Question }) {
      return Question.all({ lastCreatedAt, limit });
    },

    question(root, { id }, { Question }) {
      return Question.findOneById(id);
    },
  },
  Mutation: {
    async createQuestion(root, { input }, { Question }) {
      const id = await Question.insert(input);
      return Question.findOneById(id);
    },

    async updateQuestion(root, { id, input }, { Question }) {
      await Question.updateById(id, input);
      return Question.findOneById(id);
    },

    removeQuestion(root, { id }, { Question }) {
      return Question.removeById(id);
    },
  },
};

export default resolvers;
