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
  const school = new School({
    name: schoolParams.name,
    testParameters: schoolParams.testParameters,
    teachers: schoolParams.teacherIDs,
  });
  school.save((error: Error) => {
    if (error) {
      throw error;
    }
    callback(school);
  });
}

export const getSchoolByName = (name: string, callback: Callback): void => {
  School.findOne({name: name})
  .exec()
  .then((school: ISchoolModel) => {
    if (!school) {
      throw 'Unable to find school';
    }
    callback(school);
  });
}

export const addTeacherToSchool = (teacher: ITeacherModel, schoolName: string, callback: Callback) => {
  getSchoolByName(schoolName, (school: ISchoolModel) => {
    school.teacherIDs.push(teacher._id);
    school.save((error: Error, _school: ISchoolModel) => {
      if (error) {
        throw error;
      }
      callback(teacher);
    });
  });
}