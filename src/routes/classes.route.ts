import { Router, Request, Response } from 'express';
import { IClass, createClass } from '../library/classes/classes';
import { authorizeUser } from '../library/authentication/authentication';
import { IUserModel } from '../models/user.model';
import { IClassModel } from '../models/class.model';

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
  authorizeUser(request.headers.authorization, 'TODO')
  .then((user: IUserModel) => {
    const newClass: IClass = {
      classCode: request.body.classCode,
      studentIDs: request.body.students,
    };
    createClass(newClass, user._id)
    .then((cls: IClassModel) => {
      return response.status(200).json({
        success: 'Class was successfully created!',
        class: cls,
      });
    })
    .catch((error) => {
      return response.status(500).json({
        error: error.toString()
      });
    })
  })
  .catch((error) => {
    return response.status(401).json({
      error: error.toString()
    });
  });
});
