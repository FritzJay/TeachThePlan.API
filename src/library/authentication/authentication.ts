import { compareSync } from 'bcrypt';
import { sign, verify } from 'jsonwebtoken'
import { IUserModel } from '../../models/user.model';
import { getUserFromToken } from '../users/users';

export const authorizeUser = (token: string, userType: string): Promise<IUserModel> => {
  return new Promise((resolve, reject) => {
    getUserFromToken(token)
    .then((user) => {
      console.log(user);
      if (user.userType.includes(userType)) {
        resolve(user);
      } else {
        console.log('Invalid user type');
        reject(new Error('Invalid user type'));
      }
    })
    .catch((error) => {
      reject(error);
    })
  });
}

export const createToken = (user: IUserModel): string => {
  return sign({
      email: user.email,
      _id: user._id,
      userType: user.userType,
    },
    process.env.SECRET,
    {
      expiresIn: '2h'
    });
}

export const verifyToken = (token: string) => {
  if (token) {
    return verify(token, process.env.SECRET);
  } else {
    throw new Error('Token cannot be undefined');
  }
}

export const comparePasswords = (raw: string, hash: string): boolean => {
  return compareSync(raw, hash);
}
