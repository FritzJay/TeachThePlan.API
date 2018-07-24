import { compareSync } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken'
import { IUserModel } from '../../models/user.model';
import * as config from '../../../config';
import { getUserFromToken } from '../users/users';

export const authorizeUser = (token: string, _auth_type: string): Promise<IUserModel> => {
  return new Promise((resolve, reject) => {
    getUserFromToken(token)
    .then((user) => {
      // Perform authorization steps here
      resolve(user);
    })
    .catch((error) => {
      reject(error);
    })
  });
}

export const createToken = (user: IUserModel): string => {
  return sign({
      email: user.email,
      _id: user._id
    },
    config.secret,
    {
      expiresIn: '2h'
    });
}

export const verifyToken = (token: string) => {
  if (token) {
    return verify(token, config.secret);
  } else {
    throw new Error('Token cannot be undefined');
  }
}

export const comparePasswords = (raw: string, hash: string): boolean => {
  return compareSync(raw, hash);
}
