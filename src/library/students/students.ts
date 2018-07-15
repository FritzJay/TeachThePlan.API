import { ITest } from '../tests/tests';
import { IUser } from '../users/users';
import { Student, IStudentModel } from '../../models/student.model';
import { IClassModel } from '../../models/class.model';
import { Callback } from '../common';
import { addStudentToClass } from '../classes/classes';

export interface IStudent {
  userID: string,
  displayName: string,
  tests?: ITest[],
}

export const createStudent = (studentParams: IStudent, classCode: string, callback: Callback): void => {
  const newStudent = new Student({
    userID: studentParams.userID,
    displayName: studentParams.displayName,
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
