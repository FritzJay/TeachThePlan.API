import { ITest } from '../tests/tests';
import { Student, IStudentModel } from '../../models/student.model';
import { IClassModel } from '../../models/class.model';
import { addStudentToClass, getClassByClassCode } from '../classes/classes';
import { Types } from 'mongoose';

export interface IStudent {
  userID: Types.ObjectId,
  displayName: string,
  tests?: ITest[],
}

export const createStudent = (studentParams: IStudent, classCode: string): Promise<IStudentModel> => {
  return new Promise((resolve, reject) => {
    const newStudent = new Student({
      userID: studentParams.userID,
      displayName: studentParams.displayName,
      tests: studentParams.tests,
    });
    newStudent.save()
    .then((student: IStudentModel) => {
      addStudentToClass(student._id, classCode)
      .then((_cls: IClassModel) => {
        resolve(student);
      })
      .catch((error) => {
        reject(error);
      })
    })
    .catch((error) => {
      newStudent.remove()
      .then((_student) => {
        reject(error);
      });
    });
  });
}

export const getStudentByDisplayNameAndClassCode = (displayName: string, classCode: string): Promise<IStudentModel> => {
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      Student.findOne({
        displayName: displayName,
        userID: { $in: cls.studentIDs }
      })
      .exec()
      .then((student: IStudentModel) => {
        resolve(student);
      })
      .catch((error) => {
        resolve(error);
      });
    })
    .catch((error) => {
      reject(error);
    });
  });
}
