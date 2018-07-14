import { compareSync } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken'
import { IUserModel } from '../../models/user.model';
import * as config from '../../../config';
import { Callback } from '../common';
import { getUserFromToken } from '../users/users';

export const authorizeUser = (token: string, _auth_type: string, callback: Callback) => {
  getUserFromToken(token, (user) => {
    // TODO: Authorize stuff
    callback(user);
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
  return verify(token, config.secret);
}

export const comparePasswords = (raw: string, hash: string): boolean => {
  return compareSync(raw, hash);
}
