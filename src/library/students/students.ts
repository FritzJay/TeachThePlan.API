import { ITest } from '../tests/tests';
import { IUser } from '../users/users';
import { ITestParameters } from '../testParameters/testParameters';
import { Student, IStudentModel } from '../../models/student.model';
import { Class, IClassModel } from '../../models/class.model';
import { Callback } from '../common';

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
  Class.findOne({classCode: classCode})
  .exec()
  .then((cls: IClassModel) => {
    cls.students.push(newStudent);
    cls.save((error: Error, _cls: IClassModel) => {
      if (error) {
        callback([error], null);
      } else {
        callback(null, newStudent);
      }
    });
  })
  .catch((error: Error) => {
    callback([error], null);
  });
}

export const getStudentByDisplayNameAndClassCode = (displayName: string, classCode: string, callback: Callback): void => {
  Class.findOne({classCode: classCode}, {students: 1})
  .exec()
  .then((cls: IClassModel) => {
    const student: IStudent = cls.students.find(s => s.displayName === displayName);
    if (student) {
      callback(null, student);
    } else {
      callback([new Error('Unable to find Student')], null);
    }
  }).catch((error: Error) => {
    callback([error], null);
  });
}

const validateCreateStudentParams = (studentParams: IStudent): Error[] => {
  return [];
}
