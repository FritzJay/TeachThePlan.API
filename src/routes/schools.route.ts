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
schoolsRouter.post('/create', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'Type')
  .then((_user) => {
    const newSchool: ISchool = {
      name: request.body.name,
      teacherIDs: request.body.teachers
    };
    createSchool(newSchool)
    .then((school: ISchool) => {
      response.status(200).json({
        success: 'School was successfully created!',
        school: school
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

/*
  Returns a school who's name matches `Request.body.name`

  Authorization: TODO

  Request.body {
    name
  }
*/
schoolsRouter.get('/getByName', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'Type')
  .then(() => {
    getSchoolByName(request.body.name)
    .then((school: ISchool) => {
      response.status(200).json({
        success: 'School was found!',
        school: school,
      });
    })
    .catch((error) => {
      return response.status(500).json({
        error: error.toString()
      });
    });
  })
  .catch((error) => {
    return response.status(401).json({
      error: error.toString()
    });
  });
});
