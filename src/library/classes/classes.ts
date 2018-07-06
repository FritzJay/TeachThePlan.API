import { IClass } from '../classes/classes';
import { IStudent } from '../students/students';
import { ITestParameters } from '../testParameters/testParameters';

export interface IClass {
  classCode: string,
  testParameters?: ITestParameters,
  students?: IStudent[],
}
