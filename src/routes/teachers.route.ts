import { Router, Request, Response } from 'express';
import { ITeacher, createTeacher } from '../library/teachers/teachers';
import { getUserFromToken } from '../library/users/users';

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
teachersRouter.post('/create', (postRequest: Request, postResponse: Response) => {
  getUserFromToken(postRequest.headers.authorization, (errors, user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    } else {
      const newTeacher: ITeacher = teacherFromRequest(postRequest, user._id);
      createTeacher(newTeacher, postRequest.body.schoolName, (errors, teacher: ITeacher) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors.toString()
          });
        } else {
          return postResponse.status(200).json({
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