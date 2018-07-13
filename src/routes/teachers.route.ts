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
  authorizeUser(request.headers.authorization, 'Type', (errors, user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    } else {
      const newTeacher: ITeacher = teacherFromRequest(request, user._id);
      createTeacher(newTeacher, request.body.schoolName, (errors, teacher: ITeacher) => {
        if (errors) {
          return response.status(401).json({
            error: errors.toString()
          });
        } else {
          return response.status(200).json({
            success: 'Teacher was successfully created!',
            teacher: teacher
          });
        }
      });
    }
  });
});

const teacherFromRequest = (request: Request, userID: string): ITeacher => {
  return {
    user: userID,
    displayName: request.body.displayName,
    testParameters: request.body.testParameters,
    classIDs: request.body.classIDs
  }
}