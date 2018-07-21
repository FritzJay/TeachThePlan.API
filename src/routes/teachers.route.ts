import { Router, Request, Response } from 'express';
import { ITeacher, createTeacher } from '../library/teachers/teachers';
import { authorizeUser } from '../library/authentication/authentication';

export let teachersRouter = Router();

/*
  Creates a new teacher

  Authorization: TODO

  Request.body {
    schoolName,
    user,
    displayName,
    classIDs?
  }
*/
teachersRouter.post('/create', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'Type')
  .then((user) => {
    const newTeacher: ITeacher = {
      userID: request.body.userID,
      displayName: request.body.displayName,
      classIDs: request.body.classIDs,
    };
    createTeacher(newTeacher, request.body.schoolName)
    .then((teacher: ITeacher) => {
      response.status(200).json({
        success: 'Teacher was successfully created!',
        teacher: teacher
      });
    })
    .catch((error) => {
      response.status(500).json({
        error: error.toString()
      });
    });
  })
  .catch((error) => {
    response.status(401).json({
      error: error.toString()
    });
  });
});
