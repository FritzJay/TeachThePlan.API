import { Router, Request, Response } from 'express';
import { ISchool, createSchool, getSchoolByName } from '../library/schools/schools';
import { authorizeUser } from '../library/authentication/authentication';

export let schoolsRouter = Router();

/*
  Creates a new school

  Authorization: TODO

  Request.body: {
    name,
    teachersIDs?
  }
*/
schoolsRouter.post('/create', (request: Request, response: Response): void => {
  try {
    authorizeUser(request.headers.authorization, 'Type', (_user) => {
      const newSchool: ISchool = schoolFromRequest(request);
      createSchool(newSchool, (school: ISchool) => {
        response.status(200).json({
          success: 'School was successfully created!',
          school: school
        });
      });
    });
  } catch (error) {
    response.status(401).json({
      error: error
    });
  }
});

/*
  Returns a school who's name matches `Request.body.name`

  Authorization: TODO

  Request.body {
    name
  }
*/
schoolsRouter.get('/getByName', (request: Request, response: Response) => {
  try {
    authorizeUser(request.headers.authorization, 'Type', (_user) => {
      getSchoolByName(request.body.name, (school: ISchool) => {
        response.status(401).json({
          success: 'School was found!',
          school: school,
        });
      });
    });
  } catch (error) {
    return response.status(401).json({
      error: error
    });
  }
});

const schoolFromRequest = (request: Request): ISchool => {
  return {
    name: request.body.name,
    teacherIDs: request.body.teachers
  }
}