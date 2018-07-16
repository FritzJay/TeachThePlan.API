import { IClass } from '../classes/classes';
import { Class, IClassModel } from '../../models/class.model';
import { ITeacherModel } from '../../models/teacher.model';
import { addClassToTeacher } from '../teachers/teachers';
import { Types } from 'mongoose';
import { resolve } from 'url';

export interface IClass {
  classCode: string,
  studentIDs?: Types.ObjectId[],
}

export const createClass = (classParams: IClass, userID: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    const newClass = new Class({
      classCode: classParams.classCode,
      studentIDs: classParams.studentIDs,
    });
    newClass.save()
    .then((cls: IClassModel) => {
      addClassToTeacher(cls._id, userID)
      .then((_teacher: ITeacherModel) => {
        resolve(cls);
      })
      .catch((error) => {
        Class.remove({ _id: newClass._id })
        reject(error);
      })
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const getClassByClassCode = (classCode: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    Class.findOne({classCode: classCode})
    .exec()
    .then((cls: IClassModel) => {
      if (cls) {
        resolve(cls);
      } else {
        reject(new Error('Unable to find class'));
      }
    });
  });
}

export const addStudentToClass = (studentID: Types.ObjectId, classCode: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      cls.studentIDs.push(studentID);
      cls.save()
      .then((cls: IClassModel) => {
        resolve(cls);
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

export const removeClassByClassCode = (classCode: string): Promise<IClassModel> => {
  return new Promise((resolve, reject) => {
    getClassByClassCode(classCode)
    .then((cls: IClassModel) => {
      cls.remove()
      .then((cls: IClassModel) => {
        resolve(cls);
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
