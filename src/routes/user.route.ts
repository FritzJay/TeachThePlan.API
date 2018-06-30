import { Router, Request, Response } from 'express';
import { IUserModel } from '../models/user.model';
import { IUser } from '../interfaces/user';
import { createUser, getUser } from '../library/users/users';
import { comparePasswords, createToken } from '../library/authentication/authentication';

export let userRouter = Router();

userRouter.post('/signup', (postRequest: Request, postResponse: Response): void => {
  const newUser = userFromRequest(postRequest);
  return createUser(newUser, (error: Error, _user: IUserModel) => {
    if (error) {
      return postResponse.status(401).json({
        error: error
      });
    } else {
      return postResponse.status(200).json({
        success: 'User successfully created!'
      }); 
    }
  });
});

userRouter.post('/signin', function(postRequest: Request, postResponse: Response): void {
  const email: string = postRequest.body.email;
  return getUser(email, (error: Error, user: IUserModel) => {
    if (error) {
      return postResponse.status(401).json({
        error: error
      });
    } else {
      const passwordMatch = comparePasswords(postRequest.body.password, user.password)
      if (passwordMatch) {
        const token = createToken(user);
        return postResponse.status(200).json({
          success: "Authenticated",
          token: token
        });
      } else {
        return postResponse.status(401).json({
          error: "Invalid credentials provided."
        });
      }
    }
  });
});

const userFromRequest = (request: Request): IUser => {
  return {
    email: request.body.email,
    password: request.body.password,
    firstName: request.body.firstName,
    lastName: request.body.lastName
  };
}
