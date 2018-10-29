import { Router, Request, Response } from 'express';
import { IUserModel, User } from '../models/user.model';
import { IUser } from '../library/users/users';
import { createUser, getUserByEmail } from '../library/users/users';
import { comparePasswords, createToken } from '../library/authentication/authentication';

export let userRouter = Router();

/*
  Creates a new user

  Authorization: None

  Request.body {
    email,
    password,
    firstName,
    lastName,
    userType
  }
*/
userRouter.post('/create', (request: Request, response: Response): void => {
  const newUser: IUser = new User({
    email: request.body.email,
    password: request.body.password,
    firstName: request.body.firstName,
    lastName: request.body.lastName,
    userType: request.body.userType,
  });
  createUser(newUser)
  .then((user: IUserModel) => {
    response.status(200).json({
      success: 'User successfully created!',
      user: user
    }); 
  }).catch((error) => {
    response.status(401).json({
      error: error.toString()
    });
  });
});

/*
  Creates a new session for a user

  Authorization: None

  request.body {
    email,
    password
  }
*/
userRouter.post('/signin', function(request: Request, response: Response): void {
  const newSession = {
    email: request.body.email,
    password: request.body.password,
  }
  getUserByEmail(newSession.email)
  .then((user: IUserModel) => {
    const passwordMatch = comparePasswords(newSession.password, user.password)
    if (passwordMatch) {
      const token = createToken(user);
      response.status(200).json({
        success: "Authenticated",
        token: token
      });
    } else {
      response.status(401).json({
        error: "Invalid credentials provided."
      });
    }
  }).catch((error) => {
    response.status(401).json({
      error: error.toString()
    });
  });
});
