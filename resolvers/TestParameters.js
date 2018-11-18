import {
  assertAuthenticatedUserIsAuthorizedToUpdateTestParameters,
} from '../authorization/TestParameters';

const resolvers = {
  TestParameters: {
    id(testParameters) {
      return testParameters._id;
    },

    course(testParameters, { TestParameters }) {
      return TestParameters.course(testParameters);
    },
  },
  Query: {
    multipleTestParameters(root, { lastCreatedAt, limit }, { TestParameters }) {
      return TestParameters.all({ lastCreatedAt, limit });
    },

    testParameters(root, { id }, { TestParameters }) {
      return TestParameters.findOneById(id);
    },
  },
  Mutation: {
    async updateTestParameters(root, { id, input }, { authedUser, TestParameters, Teacher }) {
      await assertAuthenticatedUserIsAuthorizedToUpdateTestParameters(authedUser, id, Teacher)
      await TestParameters.updateById(id, input);
      return TestParameters.findOneById(id);
    },
  },
};

export default resolvers;
