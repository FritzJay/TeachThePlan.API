const resolvers = {
  TestResults: {
    id(testResults) {
      return testResults._id;
    },

    incorrect(testResults, args, { TestResults }) {
      return TestResults.incorrect(testResults);
    },

    quickest(testResults, args, { TestResults }) {
      return TestResults.quickest(testResults);
    },

    test(testResults, args, { TestResults }) {
      return TestResults.test(testResults);
    },
  },
  Query: {
    multipleTestResults(root, { lastCreatedAt, limit }, { TestResults }) {
      return TestResults.all({ lastCreatedAt, limit });
    },

    testResults(root, { id }, { TestResults }) {
      return TestResults.findOneById(id);
    },
  },
};

export default resolvers;
