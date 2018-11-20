import { AuthenticationError } from 'apollo-server-express'
import { ExtractJwt } from 'passport-jwt';
import jwt from 'jwt-simple';
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import addModelsToContext from '../model';

const KEY = '~key~';
const unAuthenticatedRoutes = [
  'IntrospectionQuery',
  'createUser',
  'createTeacher',
  'createStudent',
  'updateNewStudent',
]

export function getUserIDFromAuthHeader(req) {
  if (unAuthenticatedRoutes.includes(req.body.operationName)) {
    return undefined
  }

  const token = ExtractJwt.fromAuthHeaderWithScheme('jwt')(req)
  try {
    return jwt.decode(token, KEY)
  } catch (error) {
    throw new AuthenticationError('Authentication is required')
  }
}

export default function addPassport(app, db) {
  app.use('/login', bodyParser.urlencoded({ extended: true }));
  app.use('/login', bodyParser.json())
  app.use('/login', (req, res, next) => {
    req.context = addModelsToContext({ db });
    next();
  });

  app.post('/login', async ({ body, context }, res, next) => {
    const { email, password, role } = body;
    
    const user = await context.User.findOneByEmail(email);
    if (user && user.role === 'student') {
      const student = await context.Student.findOneByUserId(user._id);
      if (student.changePasswordRequired) {
        res.json({ changePasswordRequired: true })
        return next();
      }
    }

    if (!email || !password || !role) {
      res.json({ error: 'Username or password not set on request' });
      return next();
    }
    
    if (!user || !user.role === role || !(await bcrypt.compare(password, user.hash))) {
      res.json({ error: 'Invalid email or password'})
      return next();
    }

    const payload = {
      userId: user._id.toString(),
      role: user.role.toString(),
    };

    const token = jwt.encode(payload, KEY);
    res.json({ token });
  });
}
