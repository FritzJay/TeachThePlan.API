import { Teacher, ITeacherModel } from '../../models/teacher.model';
import { addTeacherToSchool } from '../schools/schools';
import { ISchoolModel } from '../../models/school.model';
import { Types } from 'mongoose';

export interface ITeacher {
  userID: Types.ObjectId,
  displayName: string,
  classIDs: string[],
}

export const createTeacher = (teacherParams: ITeacher, schoolName: string): Promise<ITeacherModel> => {
  return new Promise((resolve, reject) => {
    const newTeacher = new Teacher({
      userID: teacherParams.userID,
      displayName: teacherParams.displayName,
      classIDs: teacherParams.classIDs,
    });
    newTeacher.save()
    .then((teacher: ITeacherModel) => {
      addTeacherToSchool(teacher, schoolName)
      .then((_school: ISchoolModel) => {
        resolve(newTeacher);
      })
      .catch((error) => {
        reject(error);
      });
    })
    .catch((error) => {
      newTeacher.remove()
      .then((_teacher: ITeacherModel) => {
        reject(error);
      })
      .catch((error) => {
        reject(error);
      });
    });
  });
}

export const getTeacherByID = (teacherID: string): Promise<ITeacherModel> => {
  return new Promise((resolve, reject) => {
    Teacher.findById(teacherID)
    .exec()
    .then((teacher: ITeacherModel) => {
      if (teacher) {
        resolve(teacher);
      } else {
        reject(new Error('Unable to find teacher'));
      }
    })
    .catch((error) => { 
      reject(error);
    });
  });
}

export const getTeacherByUserID = (userID: string): Promise<ITeacherModel> => {
  return new Promise((resolve, reject) => {
    Teacher.findOne({ user: userID })
    .exec()
    .then((teacher: ITeacherModel) => {
      if (teacher) {
        resolve(teacher);
      } else {
        reject(new Error('Unable to find teacher'));
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const addClassToTeacher = (classID: string, userID: string): Promise<ITeacherModel> => {
  return new Promise((resolve, reject) => {
    getTeacherByUserID(userID)
    .then((teacher: ITeacherModel) => {
      teacher.classIDs.push(classID);
      teacher.save()
      .then((teacher: ITeacherModel) => {
        resolve(teacher);
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
