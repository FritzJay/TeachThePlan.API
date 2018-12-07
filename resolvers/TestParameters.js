import { UserInputError } from 'apollo-server-core';
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
      await assertAuthenticatedUserIsAuthorizedToUpdateTestParameters(authedUser, id, Teacher);
      Object.keys(input).forEach((key) => {
        if (input[key] === null) {
          throw new UserInputError(`${key} cannot be null`);
        }
      });
      await TestParameters.updateById(id, input);
      return TestParameters.findOneById(id);
    },
  },
};

export default resolvers;
