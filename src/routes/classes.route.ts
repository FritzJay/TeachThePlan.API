import { Router, Request, Response } from 'express';
import { IClass, createClass } from '../library/classes/classes';
import { authorizeUser } from '../library/authentication/authentication';

export let classesRouter = Router();

/*
  Creates a new class

  Authorization: TODO

  Request.body {
    classCode,
    studentIDs?
  }
*/
classesRouter.post('/create', (request: Request, response: Response) => {
  try {
    authorizeUser(request.headers.authorization, 'TODO', (user) => {
      const newClass: IClass = classFromRequest(request);
      createClass(newClass, user._id, (cls: IClass) => {
        return response.status(200).json({
          success: 'Class was successfully created!',
          class: cls,
        });
      });
    });
  } catch (error) {
    return response.status(401).json({
      error: error
    });
  }
});

const classFromRequest = (request: Request): IClass => {
  return {
    classCode: request.body.classCode,
    studentIDs: request.body.students,
  }
}