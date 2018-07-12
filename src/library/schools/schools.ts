import { ITestParameters } from '../testParameters/testParameters';
import { Callback } from '../common';
import { School, ISchoolModel } from '../../models/school.model';
import { ITeacherModel } from '../../models/teacher.model';

export interface ISchool {
  name: string,
  testParameters?: ITestParameters,
  teacherIDs?: string[],
}

export const createSchool = (schoolParams: ISchool, callback: Callback): void => {
  const argumentErrors = validateCreateSchoolParams(schoolParams);
  if (argumentErrors.length > 0) {
    callback(argumentErrors, null);
    return;
  }
  const school = new School({
    name: schoolParams.name,
    testParameters: schoolParams.testParameters,
    teachers: schoolParams.teacherIDs,
  });
  school.save((error: Error) => {
    if (error) {
      callback([error], null);
    } else {
      callback(null, school);
    }
  });
}

export const getSchoolByName = (name: string, callback: Callback): void => {
  School.findOne({name: name})
  .exec()
  .then((school: ISchoolModel) => {
    if (school) {
      callback(null, school);
    } else {
      callback([new Error('Unable to find school')], null);
    }
  })
  .catch((error: Error) => {
    callback([error], null);
  });
}

export const addTeacherToSchool = (teacher: ITeacherModel, schoolName: string, callback: Callback) => {
  getSchoolByName(schoolName, (errors: Error[], school: ISchoolModel) => {
    if (errors) {
      callback(errors, null);
    } else {
      if (!school) {
        callback([new Error('Unable to find school')], null);
      } else {
        school.teacherIDs.push(teacher._id);
        school.save((error: Error, school: ISchoolModel) => {
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

const validateCreateSchoolParams = (schoolParams: ISchool): Error[] => {
  return [];
}