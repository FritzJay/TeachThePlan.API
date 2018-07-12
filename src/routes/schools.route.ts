import { Router, Request, Response } from 'express';
import { ISchool, createSchool, getSchoolByName } from '../library/schools/schools';
import { getUserFromToken } from '../library/users/users';

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
schoolsRouter.post('/create', (postRequest: Request, postResponse: Response): void => {
  getUserFromToken(postRequest.headers.authorization, (errors, _user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    } else {
      const newSchool: ISchool = schoolFromRequest(postRequest);
      createSchool(newSchool, (errors, school: ISchool) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors.toString()
          });
        } else {
          return postResponse.status(200).json({
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
schoolsRouter.get('/getByName', (postRequest: Request, postResponse: Response) => {
  getUserFromToken(postRequest.headers.authorization, (errors, _user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    } else {
      getSchoolByName(postRequest.body.name, (errors, school: ISchool) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors.toString()
          });
        } else {
          return postResponse.status(401).json({
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