import fs from 'fs';

function requireGraphQL(name) {
  const filename = require.resolve(name);
  return fs.readFileSync(filename, 'utf8');
}

const typeDefs = [`
  scalar ObjID
  type Query {
    # A placeholder, please ignore
    _placeholder: Int
  }
  type Mutation {
    # A placeholder, please ignore
    _placeholder: Int
  }
`];

export default typeDefs;

typeDefs.push(requireGraphQL('./User.graphql'));

typeDefs.push(requireGraphQL('./Parent.graphql'));

typeDefs.push(requireGraphQL('./Question.graphql'));

typeDefs.push(requireGraphQL('./Student.graphql'));

typeDefs.push(requireGraphQL('./Teacher.graphql'));

typeDefs.push(requireGraphQL('./Test.graphql'));

typeDefs.push(requireGraphQL('./TestParameters.graphql'));

typeDefs.push(requireGraphQL('./Course.graphql'));

typeDefs.push(requireGraphQL('./TestResults.graphql'));

typeDefs.push(requireGraphQL('./CourseInvitation.graphql'));