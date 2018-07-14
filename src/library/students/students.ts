import { ITest } from '../tests/tests';
import { IUser } from '../users/users';
import { ITestParameters } from '../testParameters/testParameters';
import { Student, IStudentModel } from '../../models/student.model';
import { IClassModel } from '../../models/class.model';
import { Callback } from '../common';
import { addStudentToClass } from '../classes/classes';

export interface IStudent {
  user: IUser,
  displayName: string,
  testParameters?: ITestParameters
  tests?: ITest[],
}

export const createStudent = (studentParams: IStudent, classCode: string, callback: Callback): void => {
  const newStudent = new Student({
    user: studentParams.user,
    displayName: studentParams.displayName,
    testParameters: studentParams.testParameters,
    tests: studentParams.tests,
  });
  newStudent.save((error: Error, student: IStudentModel) => {
    if (error) {
      throw error;
    }
    try {
      addStudentToClass(student._id, classCode, (cls: IClassModel) => {
        callback(cls);
      });
    } catch (error) {
      student.remove();
      throw error;
    }
  });
}
