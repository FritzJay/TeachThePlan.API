import { ITest } from '../tests/tests';
import { IUser } from '../users/users';
import { ITestParameters } from '../testParameters/testParameters';

export interface IStudent {
  user: IUser,
  displayName: string,
  testParameters: ITestParameters
  tests: ITest[],
}