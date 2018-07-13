import { Router, Request, Response } from 'express';
import { ISchool, createSchool, getSchoolByName } from '../library/schools/schools';
import { authorizeUser } from '../library/authentication/authentication';

export let schoolsRouter = Router();

/*
  Creates a new school

  Authorization: TODO

  Request.body: {
    name,
    testParameters?,
    teachersIDs?
  }
*/
schoolsRouter.post('/create', (request: Request, response: Response): void => {
  authorizeUser(request.headers.authorization, 'Type', (errors, _user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    } else {
      const newSchool: ISchool = schoolFromRequest(request);
      createSchool(newSchool, (errors, school: ISchool) => {
        if (errors) {
          return response.status(401).json({
            error: errors.toString()
          });
        } else {
          return response.status(200).json({
            success: 'School was successfully created!',
            school: school
          });
        }
      });
    }
  });
});

/*
  Returns a school who's name matches `Request.body.name`

  Authorization: TODO

  Request.body {
    name
  }
*/
schoolsRouter.get('/getByName', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'Type', (errors, _user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    } else {
      getSchoolByName(request.body.name, (errors, school: ISchool) => {
        if (errors) {
          return response.status(401).json({
            error: errors.toString()
          });
        } else {
          return response.status(401).json({
            success: 'School was found!',
            school: school,
          });
        }
      });
    }
  });
});

const schoolFromRequest = (request: Request): ISchool => {
  return {
    name: request.body.name,
    testParameters: request.body.testParameters,
    teacherIDs: request.body.teachers
  }
}