import { IClass } from '../classes/classes';
import { ITestParameters } from '../testParameters/testParameters';
import { Callback } from '../common';
import { Class, IClassModel } from '../../models/class.model';
import { ITeacherModel } from '../../models/teacher.model';
import { addClassToTeacher, ITeacher } from '../teachers/teachers';

export interface IClass {
  classCode: string,
  testParameters?: ITestParameters,
  studentIDs?: string[],
}

export const createClass = (classParams: IClass, userID: string, callback: Callback): void => {
  const argumentErrors: Error[] = validateCreateClassParams(classParams);
  if (argumentErrors.length > 0) {
    callback(argumentErrors, null);
    return;
  }
  const newClass = new Class({
    classCode: classParams.classCode,
    testParameters: classParams.testParameters,
    studentIDs: classParams.studentIDs,
  });
  newClass.save((error: Error, cls: IClassModel) => {
    if (error) {
      callback([error], null);
    } else {
      addClassToTeacher(cls._id, userID, (error, _teacher: ITeacherModel) => {
        if (error) {
          cls.remove();
          callback(error, null);
        } else {
          callback(null, cls)
        }
      });
    }
  });
}

export const getClassByClassCode = (classCode: string, callback: Callback): void => {
  Class.findOne({classCode: classCode})
  .exec()
  .then((cls: IClass) => {
    if (cls) {
      callback(null, cls);
    } else {
      callback([new Error('Unable to find class')], null);
    }
  })
  .catch((error: Error) => {
    callback([error], null);
  });
}

export const addStudentToClass = (studentID: string, classCode: string, callback: Callback): void => {
  getClassByClassCode(classCode, (errors: Error[], cls: IClassModel) => {
    if (errors) {
      callback(errors, null);
    } else {
      if (cls) {
        callback([new Error('Unable to find class.')], null);
      } else {
        cls.studentIDs.push(studentID);
        cls.save((error: Error, cls: IClassModel) => {
          if (error) {
            callback([error], null);
          } else {
            callback(null, cls);
          }
        });
      }
    }
  });
}

const validateCreateClassParams = (classParams: IClass): Error[] => {
  return [];
}
