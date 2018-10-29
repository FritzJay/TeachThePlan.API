import { Router, Request, Response } from 'express';
import { ITeacher, createTeacher, getTeacherByUserID, getTeacherByEmail } from '../library/teachers/teachers';
import { authorizeUser, createToken, comparePasswords } from '../library/authentication/authentication';
import { ITeacherModel } from '../models/teacher.model';
import { Class } from '../models/class.model';
import { getUserByID } from '../library/users/users';
import { IUserModel } from '../models/user.model';

export let teachersRouter = Router();

/*
  Creates a new teacher

  Authorization: administrator

  Request.body {
    schoolName,
    user,
    displayName,
    classIDs?
  }
*/
teachersRouter.post('/create', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'administrator')
  .then((user) => {
    const newTeacher: ITeacher = {
      userID: request.body.userID,
      displayName: request.body.displayName,
      classIDs: request.body.classIDs,
    };
    createTeacher(newTeacher, request.body.schoolName)
    .then((teacher: ITeacher) => {
      response.status(200).json({
        success: 'Teacher was successfully created!',
        teacher: teacher
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
  Creates a session for a teacher
  
  Authentication: None
{
      expiresIn: '2h'
    }
  Request.body {
    email,
    password
  }
*/
teachersRouter.post('/signin', (request: Request, response: Response) => {
  const email = request.body.email;
  const password = request.body.password;

  getTeacherByEmail(email)
    .then((teacher: ITeacherModel) => {
      getUserByID(teacher.userID)
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
              name: teacher.displayName,
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

/*
  Returns a list of classes owned by a teacher

  Authorization: teacher
*/
teachersRouter.get('/classes', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'teacher')
    .then((user) => {
      getTeacherByUserID(user._id)
        .then((teacher: ITeacherModel) => {
          Class.find({
            _id: { $in: teacher.classIDs }
          })
            .exec()
            .then((classes) => {
              response.status(200).json({
                success: 'Classes where found',
                classes: classes
              });
            })
            .catch((error) => {
              response.status(500).json({
                error: error.toString(),
              });
            })
        })
        .catch((error) => {
          response.status(500).json({
            error: error.toString(),
          });
        })
    })
    .catch((error) => {
      response.status(401).json({
        error: error.toString(),
      })
    })
})