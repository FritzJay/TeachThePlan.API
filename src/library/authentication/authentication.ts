import { compareSync } from 'bcrypt';
import { sign, decode } from 'jsonwebtoken'
import { IUserModel } from '../../models/user.model';
import * as config from '../../../config';

export const createToken = (user: IUserModel) => {
  return sign({
      email: user.email,
      _id: user._id
    },
    config.secret,
    {
      expiresIn: '2h'
    });
}

export const decodeToken = (token: string): string | { [key: string]: any } => {
  return decode(token);
}

export const comparePasswords = (raw: string, hash: string): boolean => {
  return compareSync(raw, hash);
}