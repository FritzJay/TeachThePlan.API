import { ITeacher } from '../teachers/teachers';
import { ITestParameters } from '../testParameters/testParameters';

export interface ISchool {
  name: string,
  testParameters: ITestParameters,
  teachers: ITeacher[],
}