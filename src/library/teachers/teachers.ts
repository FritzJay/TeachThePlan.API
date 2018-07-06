import { IUser } from '../users/users';
import { IClass } from '../classes/classes';
import { ITestParameters } from '../testParameters/testParameters';

export interface ITeacher {
  user: IUser,
  displayName: string,
  testParameters?: ITestParameters,
  classes?: IClass[],
}