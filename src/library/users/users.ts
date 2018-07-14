import { hashSync } from 'bcrypt';
import { Types } from 'mongoose';
import { Callback } from '../common';
import { User, IUserModel } from '../../models/user.model';
import { verifyToken } from '../authentication/authentication';

export interface IUser {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export const createUser = (userParams: IUser, callback: Callback): void => {
  new User({
    _id: new Types.ObjectId(),
    email: userParams.email,
    password: hashSync(userParams.password, 10),
    firstName: userParams.firstName,
    lastName: userParams.lastName
  })
  .save()
  .then((newUser) => {
    callback(newUser);
  });
}

export const getUserFromToken = (token: string, callback: Callback): void => {
  const decodedToken = verifyToken(token);
  const email = decodedToken['email'];
  getUserByEmail(email, (user: IUserModel) => {
    callback(user);
  });
}

export const getUserByEmail = (email: string, callback: Callback): void => {
  User.findOne({ email: email })
  .exec()
  .then((user: IUserModel) => {
    if (!user) {
      throw 'Could not find user';
    }
    callback(user);
  });
}

export const getUserByID = (id: Types.ObjectId, callback: Callback): void => {
  User.findOne({ _id: id })
  .exec()
  .then((user: IUserModel) => {
    if (!user) {
      throw 'Could not find user';
    }
    callback(user);
  });
}
