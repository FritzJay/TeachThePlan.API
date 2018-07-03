import { Router, Request, Response } from 'express';
import { Types } from 'mongoose';
import { ITestModel } from '../models/test.model';
import { IUserModel } from '../models/user.model';
import { getAvailableTests, newTest, gradeTest, IAvailableTests } from '../library/tests/tests';
import { getUserByID } from '../library/users/users';
import { decodeToken } from '../library/authentication/authentication';

export let testsRouter = Router();

testsRouter.post('/available', (postRequest: Request, postResponse: Response): void => {
  const authToken = decodeToken(postRequest.headers.authorization);
  const userID = new Types.ObjectId(authToken['id']); // TODO: Get userID from header
  getUserByID(userID, (errors: Error[], user: IUserModel) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors
      });
    } else {
      return getAvailableTests(user, (errors: Error[], availableTests: IAvailableTests) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors
          });
        } else {
          return postResponse.status(200).json({
            availableTests: availableTests
          }); 
        }
      });
    }
  });
});
