import { Router, Request, Response } from 'express';
import { IUserModel } from '../models/user.model';
import { getUserByID } from '../library/users/users';
import { IStudentModel, Student } from '../models/student.model';
import { createToken, authorizeUser, comparePasswords } from '../library/authentication/authentication';
import { getStudentByEmail, IStudent, createStudent } from '../library/students/students';

export let studentRouter = Router();

/*
  Creates a new student

  Authentication: teacher,

  Request.body {
    userID,
    displayName,
    classCode
  }
*/
studentRouter.post('/create', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'teacher')
  .then((user: IUserModel) => {
    const classCode: string = request.body.classCode;
    const newStudent: IStudent = new Student({
      userID: request.body.userID,
      displayName: request.body.displayName,
    });
    // Authorize user is a teacher that has a classID with a classCode of `classCode`
    createStudent(newStudent, classCode)
    .then((student: IStudentModel) => {
      response.status(200).json({
        success: 'Student successfully created!',
        student: student
      });
    })
    .catch((error) => {
      response.status(500).json({
        error: error.toString(),
      });
    });
  })
  .catch((error) => {
    response.status(401).json({
      error: error.toString(),
    });
  });
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
studentRouter.post('/signin', (request: Request, response: Response) => {
  const email = request.body.email;
  const password = request.body.password;
  getStudentByEmail(email)
  .then((student: IStudentModel) => {
    getUserByID(student.userID)
    .then((user: IUserModel) => {
      if (!comparePasswords(password, user.password)) {
        response.status(401).json({
          error: 'Incorrect password'
        })
      } else {
        const token = createToken(user);
        response.status(200).json({
          success: "Authenticated",
          user: {
            name: student.displayName,
          },
          token: token,
        });
      }
    })
    .catch((error) => {
      response.status(500).json({
        error: error.toString(),
      });
    });
  })
  .catch((error) => {
    response.status(401).json({
      error: error.toString(),
    });
  });
});