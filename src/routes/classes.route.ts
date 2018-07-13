import { Router, Request, Response } from 'express';
import { IClass, createClass } from '../library/classes/classes';
import { authorizeUser } from '../library/authentication/authentication';

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
classesRouter.post('/create', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'TODO', (errors, user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    } else {
      const newClass: IClass = classFromRequest(request);
      createClass(newClass, user._id, (errors: Error[], cls: IClass) => {
        if (errors) {
          return response.status(401).json({
            error: errors.toString()
          });
        } else {
          return response.status(200).json({
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