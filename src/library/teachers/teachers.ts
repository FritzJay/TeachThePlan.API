import { Teacher, ITeacherModel } from '../../models/teacher.model';
import { addTeacherToSchool } from '../schools/schools';
import { ISchoolModel } from '../../models/school.model';
import { Types } from 'mongoose';
import { getUserByEmail } from '../users/users';

export interface ITeacher {
  userID: Types.ObjectId,
  displayName: string,
  classIDs: string[],
}

export const createTeacher = (teacherParams: ITeacher, schoolName: string): Promise<ITeacherModel> => {
  console.log('Creating a new teacher. ITeacher:');
  console.log(teacherParams);
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
      Teacher.remove({ _id: newTeacher._id })
      .then((_teacher: ITeacherModel) => {
        reject(error);
      })
      .catch((error) => {
        reject(error);
      });
    });
  });
}


export const getTeacherByEmail = async (email: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by email');
  console.log(`email: ${email}`);

  const user = await getUserByEmail(email)
  return await Teacher.findOne({ userID: user._id })
}

export const getTeacherByID = (teacherID: string): Promise<ITeacherModel> => {
  console.log('Getting teacher by teacherID');
  console.log(`teacherID: ${teacherID}`);
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
  console.log('Getting teacher by userID');
  console.log(`UserID: ${userID}`);
  return new Promise((resolve, reject) => {
    Teacher.findOne({ userID: userID })
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
  console.log('Adding class to teacher');
  console.log(`classID: ${classID}`);
  console.log(`userID: ${userID}`);
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

export const removeTeacherByID = (teacherID: Types.ObjectId): Promise<ITeacher> => {
  return new Promise((resolve, reject) => {
    Teacher.findByIdAndRemove(teacherID)
    .then((teacher: ITeacherModel) => {
      resolve(teacher);
    })
    .catch((error) => {
      reject(error);
    });
  });
}
