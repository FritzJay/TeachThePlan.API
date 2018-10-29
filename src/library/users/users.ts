import { hashSync } from 'bcrypt';
import { Types } from 'mongoose';
import { User, IUserModel } from '../../models/user.model';
import { verifyToken } from '../authentication/authentication';

export interface IUser {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  userType?: string[];
}

export const createUser = (userParams: IUser): Promise<IUserModel> => {
  console.log('Creating a new user. IUser:');
  console.log(userParams);
  return new Promise((resolve, reject) => {
    new User({
      email: userParams.email,
      password: hashSync(userParams.password, 10),
      firstName: userParams.firstName,
      lastName: userParams.lastName,
      userType: userParams.userType,
    })
    .save()
    .then((newUser) => {
      resolve(newUser);
    })
    .catch((error) => {
      reject(error);
    })
  });
}

export const getUserFromToken = (token: string): Promise<IUserModel> => {
  console.log('Getting user from token');
  console.log(`token: ${token}`);
  return new Promise((resolve, reject) => {
    const decodedToken = verifyToken(token);
    const email = decodedToken['email'];
    getUserByEmail(email)
    .then((user) => {
      resolve(user);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const getUserByEmail = (email: string): Promise<IUserModel> => {
  console.log('Getting user by email');
  console.log(`email: ${email}`);
  return new Promise((resolve, reject) => {
    User.findOne({ email: email })
    .exec()
    .then((user: IUserModel) => {
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Could not find user'));
      }
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const getUserByID = (id: Types.ObjectId): Promise<IUserModel> => {
  console.log('Getting user by userID');
  console.log(`userID: ${id}`);
  return new Promise((resolve, reject) => {
    User.findOne({ _id: id })
    .exec()
    .then((user: IUserModel) => {
      if (user) {
        resolve(user);
      } else {
        reject(new Error('Could not find user'));
      }
    })
    .catch((error) => {
      reject(error);
    })
  });
}

export const removeUserByID = (id: Types.ObjectId): Promise<IUserModel> => {
  console.log('Removing user by userID');
  console.log(`userID: ${id}`);
  return new Promise((resolve, reject) => {
    User.findByIdAndRemove(id)
    .then((user: IUserModel) => {
      resolve(user);
    })
    .catch((error) => {
      reject(error);
    });
  });
}