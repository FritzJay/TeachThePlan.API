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
    lastName
  }
*/
userRouter.post('/create', (request: Request, response: Response): void => {
  const newUser: IUser = new User({
    email: request.body.email,
    password: request.body.password,
    firstName: request.body.firstName,
    lastName: request.body.lastName
  });
  return createUser(newUser, (errors: Error[], user: IUserModel) => {
    if (errors) {
      return response.status(401).json({
        error: errors
      });
    } else {
      return response.status(200).json({
        success: 'User successfully created!',
        user: user
      }); 
    }
  });
});

/*
  Creates a new session for a user

  Authorization: TODO

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
  return getUserByEmail(newSession.email, (errors: Error[], user: IUserModel) => {
    if (errors) {
      return response.status(401).json({
        error: errors
      });
    } else {
      const passwordMatch = comparePasswords(newSession.password, user.password)
      if (passwordMatch) {
        const token = createToken(user);
        return response.status(200).json({
          success: "Authenticated",
          token: token
        });
      } else {
        return response.status(401).json({
          error: "Invalid credentials provided."
        });
      }
    }
  });
});
