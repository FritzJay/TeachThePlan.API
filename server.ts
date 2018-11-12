import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import { buildSchema } from 'graphql'
import { urlencoded, json } from 'body-parser'
import { connect } from 'mongoose'
import { baseRouter } from './src/routes/base.route'
import { userRouter } from './src/routes/user.route'
import { testsRouter } from './src/routes/tests.route'
import { schoolsRouter } from './src/routes/schools.route'
import { teachersRouter } from './src/routes/teachers.route'
import { classesRouter } from './src/routes/classes.route'
import { studentRouter } from './src/routes/students.route'
import { parentRouter } from './src/routes/parents.route';
import { testParametersRoute } from './src/routes/testParameters.route';
require('dotenv').config()

const app = express()

const PORT: number = parseInt(process.env.PORT, 10) || 3000

const allowCrossDomain = (req, res, next) => {
  const allowedOrigins = [process.env.TTP_URL]

  const origin = req.headers.origin

  allowedOrigins.forEach((allowed: string) => {
    if (allowed.startsWith(origin)) {
      res.header('Access-Control-Allow-Origin', origin)
    }
  })

  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH')
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  next()
}

connect(`mongodb://factfluency:${process.env.MONGODB_PASSWORD}@factfluency-shard-00-00-vywlr.mongodb.net:27017,factfluency-shard-00-01-vywlr.mongodb.net:27017,factfluency-shard-00-02-vywlr.mongodb.net:27017/test?ssl=true&replicaSet=FactFluency-shard-0&authSource=admin&retryWrites=true`, {
  useNewUrlParser: true,
})

// TEMPORARY GRAPHQL
const schema = buildSchema(`
  type Query {
    hello: String
  }
`)

const root = {
  hello: () => {
    return 'Hello world!'
  }
}


// END TEMPORARY GRAPHQL

app.use(urlencoded({ extended: false }))
app.use(json())
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}))

app.listen(PORT, () => {
  console.log(`Listening for api requests on ${PORT}`)
})
