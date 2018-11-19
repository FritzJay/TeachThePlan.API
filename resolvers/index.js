import { ObjectId } from 'mongodb';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { merge } from 'lodash';

import courseResolvers from './Course';
import parentResolvers from './Parent';
import userResolvers from './User';
import questionResolvers from './Question';
import studentResolvers from './Student';
import teacherResolvers from './Teacher';
import testResolvers from './Test';
import testParametersResolvers from './TestParameters';
import testResultsResolvers from './TestResults';
import courseInvitationResolvers from './CourseInvitation';

const resolvers = {};

resolvers.ObjID = new GraphQLScalarType({
  name: 'ObjID',
  description: 'Id representation, based on Mongo Object Ids',
  parseValue(value) {
    return ObjectId(value);
  },
  serialize(value) {
    return value.toString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return ObjectId(ast.value);
    }
    return null;
  },
});

export default resolvers;

merge(resolvers, userResolvers);

merge(resolvers, parentResolvers);

merge(resolvers, questionResolvers);

merge(resolvers, studentResolvers);

merge(resolvers, teacherResolvers);

merge(resolvers, testResolvers);

merge(resolvers, testParametersResolvers);

merge(resolvers, courseResolvers);

merge(resolvers, testResultsResolvers);

merge(resolvers, testResultsResolvers);

merge(resolvers, courseInvitationResolvers);
