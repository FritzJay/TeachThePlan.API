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
    testParameters?,
    classIDs?
  }
*/
teachersRouter.post('/create', (request: Request, response: Response) => {
  try {
    authorizeUser(request.headers.authorization, 'Type', (user) => {
      const newTeacher: ITeacher = teacherFromRequest(request, user._id);
      createTeacher(newTeacher, request.body.schoolName, (teacher: ITeacher) => {
        response.status(200).json({
          success: 'Teacher was successfully created!',
          teacher: teacher
        });
      });
    });
  } catch (error) {
    response.status(401).json({
      error: error
    });
  }
});

const teacherFromRequest = (request: Request, userID: string): ITeacher => {
  return {
    user: userID,
    displayName: request.body.displayName,
    testParameters: request.body.testParameters,
    classIDs: request.body.classIDs
  }
}