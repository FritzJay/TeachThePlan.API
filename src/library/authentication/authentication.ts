import { compareSync } from 'bcrypt';
import { sign } from 'jsonwebtoken'
import { IUserModel } from '../../models/user.model';

export const createToken = (user: IUserModel) => {
  return sign({
      email: user.email,
      _id: user._id
    },
    'secret',
    {
      expiresIn: '2h'
    });
}

export const comparePasswords = (raw: string, hash: string): boolean => {
  return compareSync(raw, hash);
}