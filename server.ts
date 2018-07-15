import * as express from 'express';
import * as config from './config';
var app = express();
import { urlencoded, json } from 'body-parser';
import { connect } from 'mongoose';
import { userRouter } from './src/routes/user.route';
import { testsRouter } from './src/routes/tests.route';
import { schoolsRouter } from './src/routes/schools.route';
import { teachersRouter } from './src/routes/teachers.route';
import { classesRouter } from './src/routes/classes.route';
import { studentRouter } from './src/routes/students.route';

const PORT: number = 3000;

connect(`mongodb://factfluency:${config.mongodbPassword}@factfluency-shard-00-00-vywlr.mongodb.net:27017,factfluency-shard-00-01-vywlr.mongodb.net:27017,factfluency-shard-00-02-vywlr.mongodb.net:27017/test?ssl=true&replicaSet=FactFluency-shard-0&authSource=admin&retryWrites=true`);

app.use(urlencoded({ extended: false }));
app.use(json());
app.use('/user', userRouter);
app.use('/tests', testsRouter);
app.use('/schools', schoolsRouter);
app.use('/teachers', teachersRouter);
app.use('/classes', classesRouter);
app.use('/students', studentRouter);

app.listen(PORT, (): void => {
  console.log('Server is running on port', PORT);
});
