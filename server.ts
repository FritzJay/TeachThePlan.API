import * as express from 'express';
var app = express();
import { urlencoded, json } from 'body-parser';
import { connect } from 'mongoose';
import { userRouter } from './src/routes/user.route';

const PORT: number = 3000;

connect('mongodb://localhost/jwtauth');

app.use(urlencoded({ extended: false }));
app.use(json());
app.use('/user', userRouter);

app.listen(PORT, (): void => {
  console.log('Server is running on port', PORT);
});
