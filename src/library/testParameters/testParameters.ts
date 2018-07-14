import { ITestParameters } from '../testParameters/testParameters';
import { IUser } from '../users/users';
import { Callback } from '../common';
import { TestParameters, ITestParametersModel } from '../../models/testParameters.model';

export interface ITestParameters {
  operator: string;
  number: number;
  questions: number;
  randomQuestions: number;
  duration: number;
}

export const createTestParameters = (params: ITestParameters, callback: Callback): void => {
  new TestParameters({...params})
  .save()
  .then((newTestParams: ITestParametersModel) => {
    callback(newTestParams);
  });
}

export const getTestParameters = (_userID: string, callback): void => {
  const testParameters = {
    operator: 'sample operator',
    number: 5,
    questions: 20,
    randomQuestions: 0,
    duration: 75,
  }
  callback(null, testParameters);
}