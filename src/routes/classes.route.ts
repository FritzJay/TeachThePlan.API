import { Router, Request, Response } from 'express';
import { IClass, createClass } from '../library/classes/classes';
import { getUserFromToken } from '../library/users/users';

export let classesRouter = Router();

/*
  Creates a new class

  Authorization: TODO

  Request.body {
    classCode,
    testParameters?,
    studentIDs?
  }
*/
classesRouter.post('/create', (postRequest: Request, postResponse: Response) => {
  getUserFromToken(postRequest.headers.authorization, (errors, user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    } else {
      const newClass: IClass = classFromRequest(postRequest);
      createClass(newClass, user._id, (errors: Error[], cls: IClass) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors.toString()
          });
        } else {
          return postResponse.status(200).json({
            success: 'Class was successfully created!',
            class: cls,
          });
        }
      });
    }
  });
});

const classFromRequest = (request: Request): IClass => {
  return {
    classCode: request.body.classCode,
    testParameters: request.body.testParameters,
    studentIDs: request.body.students,
  }
}