import { ITestParameters } from '../testParameters/testParameters';
import { Callback } from '../common';
import { Teacher, ITeacherModel } from '../../models/teacher.model';
import { addTeacherToSchool } from '../schools/schools';
import { ISchoolModel } from '../../models/school.model';

export interface ITeacher {
  user: string,
  displayName: string,
  testParameters?: ITestParameters,
  classIDs: string[],
}

export const createTeacher = (teacherParams: ITeacher, schoolName: string, callback: Callback): void => {
  const argumentErrors = validateTeacherParams(teacherParams);
  if (argumentErrors.length > 0) {
    callback(argumentErrors, null);
    return;
  }
  const newTeacher = new Teacher({
    user: teacherParams.user,
    displayName: teacherParams.displayName,
    testParameters: teacherParams.testParameters,
    classIDs: teacherParams.classIDs,
  });
  newTeacher.save((error: Error, teacher: ITeacherModel) => {
    if (error) {
      callback([error], null);
    } else {
      addTeacherToSchool(teacher, schoolName, (errors: Error[], _school: ISchoolModel) =>{
        if (errors) {
          callback(errors, null);
        } else {
          callback(null, teacher);
        }
      });
    }
  });
}

export const getTeacherByID = (teacherID: string, callback: Callback): void => {
  Teacher.findById(teacherID)
  .exec()
  .then((teacher: ITeacherModel) => {
    if (teacher) {
      callback(null, teacher);
    } else {
      callback([new Error('Unable to find teacher')], null);
    }
  })
  .catch((error: Error) => {
    callback([error], null);
  });
}

export const getTeacherByUserID = (userID: string, callback: Callback): void => {
  Teacher.findOne({ user: userID })
  .exec()
  .then((teacher: ITeacherModel) => {
    callback(null, teacher);
  })
  .catch((error: Error) => {
    callback([error], null);
  });
}

export const addClassToTeacher = (classID: string, userID: string, callback: Callback): void => {
  getTeacherByUserID(userID, (errors: Error[], teacher: ITeacherModel) => {
    if (errors) {
      callback(errors, null);
    } else {
      if (!teacher) {
        callback([new Error('Unable to find teacher')], null)
      } else {
        teacher.classIDs.push(classID);
        teacher.save((error: Error, teacher: ITeacherModel) => {
          if (error) {
            callback([error], null);
          } else {
            callback(null, teacher);
          }
        });
      }
    }
  });
}

const validateTeacherParams = (teacherParams: ITeacher): Error[] => {
  return [];
}
