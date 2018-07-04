import { hash } from 'bcrypt';
import { Types } from 'mongoose';
import { IUser } from '../../interfaces/user';
import { Callback } from '../../interfaces/callback';
import { User, IUserModel } from '../../models/user.model';
import { decodeToken } from '../authentication/authentication';
      
export const createUser = (user: IUser, callback: Callback): void => {
  hash(user.password, 10)
  .then((hash) => {
    new User({
      _id: new Types.ObjectId(),
      email: user.email,
      password: hash,
      firstName: user.firstName,
      lastName: user.lastName
    })
    .save()
    .then((newUser) => {
      callback(null, newUser);
    })
    .catch(saveError => {
      callback([saveError], null);
    });
  })
  .catch((hashError: Error) => {
    callback([hashError], null);
  });
}

export const getUserByEmail = (email: string, callback: Callback): void => {
  User.findOne({ email: email })
  .exec()
  .then((user: IUserModel) => {
    callback(null, user);
  })
  .catch((error: Error) => {
    callback([error], null)
  });
}

export const getUserByID = (id: Types.ObjectId, callback: Callback): void => {
  User.findOne({ _id: id })
  .exec()
  .then((user: IUserModel) => {
    callback(null, user);
  })
  .catch((error: Error) => {
    callback([error], null);
  });
}

export const getUserFromToken = (token: string, callback: Callback): void => {
  const decodedToken = decodeToken(token);
  const email = decodedToken['email'];
  getUserByEmail(email, (errors: Error[], user: IUserModel) => {
    if (errors) {
      callback(errors, null);
    } else if (user === null) {
      const error = new Error('Could not find user by email.');
      callback([error], null);
    } else {
      callback(null, user);
    }
  });
}