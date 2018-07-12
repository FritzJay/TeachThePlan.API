import { Router, Request, Response } from 'express';
import { IUserModel } from '../models/user.model';
import { IUser } from '../library/users/users';
import { createUser, getUserByEmail } from '../library/users/users';
import { comparePasswords, createToken } from '../library/authentication/authentication';

export let userRouter = Router();

userRouter.post('/signup', (postRequest: Request, postResponse: Response): void => {
  const newUser: IUser = userFromRequest(postRequest);
  return createUser(newUser, (errors: Error[], _user: IUserModel) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors
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
  return getUserByEmail(email, (errors: Error[], user: IUserModel) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors
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
