import { ITestParameters } from '../testParameters/testParameters';
import { TestParameters, ITestParametersModel } from '../../models/testParameters.model';
import { Types } from 'mongoose';

export interface ITestParameters {
  objectID?: Types.ObjectId;
  operator: string;
  number: number;
  questions: number;
  randomQuestions: number;
  duration: number;
}

export const createTestParameters = (params: ITestParameters): Promise<ITestParametersModel> => {
  return new Promise((resolve, reject) => {
    new TestParameters({...params})
    .save()
    .then((newTestParams: ITestParametersModel) => {
      resolve(newTestParams);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const getTestParameters = (_userID: string): Promise<ITestParameters> => {
  return new Promise((resolve, _reject) => {
    const testParameters = {
      operator: 'sample operator',
      number: 5,
      questions: 20,
      randomQuestions: 0,
      duration: 75,
    }
    resolve(testParameters);
  });
}