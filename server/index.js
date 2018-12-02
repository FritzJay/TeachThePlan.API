import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { MongoClient } from 'mongodb';
import cors from 'cors';

import typeDefs from '../schema';
import resolvers from '../resolvers';
import addModelsToContext from '../model';
import authenticate, { getUserIDFromAuthHeader } from './authenticate';

const {
  PORT = 3000,
  MONGO_URL = 'mongodb://localhost:27017/database',
  TTP_URL = 'http://localhost:3001',
} = process.env;

const corsOptions = {
  origin: TTP_URL,
  optionsSuccessStatus: 200,
}
const app = express().use(cors(corsOptions));

async function startServer() {
  const client = await new MongoClient(MONGO_URL, { useNewUrlParser: true }).connect()
  const db = await client.db('database')
  
  authenticate(app, db);

  const schema = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      return {
        ...addModelsToContext({ db }),
        authedUser: getUserIDFromAuthHeader(req),
      }
    },
    playground: {
      endpoint: 'graphql',
      settings: {
        'editor.theme': 'light',
      },
    },
  });

  schema.applyMiddleware({ app });
  
  app.listen(PORT, () => console.log(
    `API Server is now running on http://localhost:${PORT}`
  ));
}
    
startServer()
  .then(() => {
    console.log('All systems go');
  })
  .catch((e) => {
    console.error('Uncaught error in startup');
    console.error(e);
    console.trace(e);
  });
