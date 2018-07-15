import { Router, Request, Response } from 'express';
import { IUserModel } from '../models/user.model';
import { getUserByID } from '../library/users/users';
import { IStudentModel, Student } from '../models/student.model';
import { createToken } from '../library/authentication/authentication';
import { getStudentByDisplayNameAndClassCode, IStudent, createStudent } from '../library/students/students';

export let studentRouter = Router();

/*
  Creates a new student

  Authentication: TODO,

  Request.body {
    userID,
    displayName,
    classCode
  }
*/
studentRouter.post('/create', (request: Request, response: Response): void => {
  const classCode: string = request.body.classCode;
  const newStudent: IStudent = new Student({
    userID: request.body.userID,
    displayName: request.body.displayName,
  });
  try {
    // Authorize user is a teacher that has a classID with a classCode of `classCode`
    createStudent(newStudent, classCode, (student: IStudentModel) => {
      response.status(200).json({
        success: 'Student successfully created!',
        student: student
      });
    });
  } catch (error) {
    response.status(401).json({
      error: error,
    });
  }
});

/*
  Creates a session for a student
  
  Authentication: None
{
      expiresIn: '2h'
    }
  Request.body {
    displayName,
    classCode
  }
*/
studentRouter.post('/signinstudent', (request: Request, response: Response): void => {
  const displayName = request.body.displayName;
  const classCode = request.body.classCode;
  try {
    getStudentByDisplayNameAndClassCode(displayName, classCode, (student: IStudentModel) => {
      getUserByID(student.userID, (user: IUserModel) => {
        const token = createToken(user);
        response.status(200).json({
          success: "Authenticated",
          user: {
            name: student.displayName,
          },
          token: token,
        });
      });
    });
  } catch (error) {
    response.status(401).json({
      error: error,
    });
  }
});