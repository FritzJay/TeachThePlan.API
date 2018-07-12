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
  const argumentErrors: Error[] = validateCreateStudentParams(studentParams);
  if (argumentErrors.length > 0) {
    callback(argumentErrors, null);
    return;
  }
  const newStudent = new Student({
    user: studentParams.user,
    displayName: studentParams.displayName,
    testParameters: studentParams.testParameters,
    tests: studentParams.tests,
  });
  newStudent.save((error: Error, student: IStudentModel) => {
    if (error) {
      callback([error], null);
    } else {
      addStudentToClass(student._id, classCode, (errors: Error[], cls: IClassModel) => {
        if (errors) {
          callback(errors, null);
        } else {
          callback(null, cls);
        }
      });
    }
  });
}

export const getStudentByDisplayNameAndClassCode = (displayName: string, classCode: string, callback: Callback): void => {
}

const validateCreateStudentParams = (studentParams: IStudent): Error[] => {
  return [];
}
