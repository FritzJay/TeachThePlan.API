import * as express from 'express'
import * as graphqlHTTP from 'express-graphql'
import { urlencoded, json } from 'body-parser'
import { connect } from 'mongoose'
import * as cors from 'cors'
require('dotenv').config()

import { schema, root } from './src/graphql'

const app = express()

const PORT: number = parseInt(process.env.PORT, 10) || 3000

const corsOptions = {
  origin: process.env.TTP_URL,
  optionsSuccessStatus: 200,
}

connect(`mongodb://factfluency:${process.env.MONGODB_PASSWORD}@factfluency-shard-00-00-vywlr.mongodb.net:27017,factfluency-shard-00-01-vywlr.mongodb.net:27017,factfluency-shard-00-02-vywlr.mongodb.net:27017/test?ssl=true&replicaSet=FactFluency-shard-0&authSource=admin&retryWrites=true`, {
  useNewUrlParser: true,
})

app.use(urlencoded({ extended: false }))
app.use(json())
app.use(cors(corsOptions))
app.use('/graphql', graphqlHTTP({
  schema,
  rootValue: root,
  graphiql: true,
}))

app.listen(PORT, () => {
  console.log(`Listening for api requests on ${PORT}`)
})
