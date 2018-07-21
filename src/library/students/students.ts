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
  console.log('Creating a new student. IStudent:');
  console.log(studentParams);
  console.log(`classCode: ${classCode}`);
  return new Promise((resolve, reject) => {
    const newStudent = new Student({
      userID: studentParams.userID,
      displayName: studentParams.displayName,
      tests: studentParams.tests,
    });
    newStudent.save()
    .then((student: IStudentModel) => {
      addStudentToClass(student._id, classCode.toString())
      .then((_cls: IClassModel) => {
        resolve(student);
      })
      .catch((error) => {
        Student.remove({ _id: newStudent._id })
        .then((error) => {
          reject(error);
        });
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
  console.log('Getting student by display name and class code');
  console.log(`displayName: ${displayName}`);
  console.log(`classCode: ${classCode}`);
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      Student.findOne({
        displayName: displayName,
        _id: { $in: cls.studentIDs }
      })
      .exec()
      .then((student: IStudentModel) => {
        if (student) {
          resolve(student);
        } else {
          reject(new Error('Could not find student'));
        }
      })
      .catch((error) => {
        reject(error);
      });
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const removeStudentByID = (studentID: Types.ObjectId): Promise<IStudentModel> => {
  return new Promise((resolve, reject) => {
    Student.findByIdAndRemove(studentID)
    .then((student: IStudentModel) => {
      resolve(student);
    })
    .catch((error) => {
      reject(error);
    });
  });
}
