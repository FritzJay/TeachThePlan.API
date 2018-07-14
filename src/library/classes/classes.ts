import { IClass } from '../classes/classes';
import { Callback } from '../common';
import { Class, IClassModel } from '../../models/class.model';
import { ITeacherModel } from '../../models/teacher.model';
import { addClassToTeacher } from '../teachers/teachers';

export interface IClass {
  classCode: string,
  studentIDs?: string[],
}

export const createClass = (classParams: IClass, userID: string, callback: Callback): void => {
  const newClass = new Class({
    classCode: classParams.classCode,
    studentIDs: classParams.studentIDs,
  });
  newClass.save((error: Error, cls: IClassModel) => {
    if (error) {
      throw error;
    }
    try {
      addClassToTeacher(cls._id, userID, (_teacher: ITeacherModel) => {
        callback(cls)
      });
    } catch (error) {
      cls.remove();
      throw error;
    }
  });
}

export const getClassByClassCode = (classCode: string, callback: Callback): void => {
  Class.findOne({classCode: classCode})
  .exec()
  .then((cls: IClass) => {
    if (!cls) {
      throw 'Unable to find class';
    }
    callback(cls);
  });
}

export const addStudentToClass = (studentID: string, classCode: string, callback: Callback): void => {
  getClassByClassCode(classCode, (cls: IClassModel) => {
    cls.studentIDs.push(studentID);
    cls.save((error: Error, cls: IClassModel) => {
      if (error) {
        throw error;
      }
      callback(cls);
    });
  });
}
