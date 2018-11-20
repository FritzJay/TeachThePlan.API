import { ObjectId } from 'mongodb';
import { assertUserWithEmailDoesNotExist } from '../authorization/User';
import {
  assertAuthenticatedUserIsAuthorizedToUpdateStudent,
  assertAuthenticatedUserIsAuthorizedToRemoveStudent,
  assertChangePasswordIsRequired,
} from '../authorization/Student';

import { assertAuthenticatedUserIsAuthorizedToUpdateCourse } from '../authorization/Course';

import { createUniqueUsernameForNewStudent } from '../src/library/User';

const resolvers = {
  Student: {
    id(student) {
      return student._id;
    },

    courses(student, { lastCreatedAt, limit }, { Student }) {
      return Student.courses(student, { lastCreatedAt, limit });
    },

    tests(student, { lastCreatedAt, limit }, { Student }) {
      return Student.tests(student, { lastCreatedAt, limit });
    },

    user(student, args, { Student }) {
      return Student.user(student);
    },

    parent(student, args, { Student }) {
      return Student.parent(student);
    },

    courseInvitations(student, { lastCreatedAt, limit }, { Student }) {
      return Student.courseInvitations(student, { lastCreatedAt, limit })
    }
  },
  Query: {
    students(root, { lastCreatedAt, limit }, { Student }) {
      return Student.all({ lastCreatedAt, limit });
    },

    student(root, { id }, { authedUser, Student }) {
      if (id === undefined) {
        return Student.findOneByUserId(authedUser.userId)
      }
      return Student.findOneById(id);
    },
  },
  Mutation: {
    async createStudent(root, { input }, { Student, User }) {
      const { user: userInput, ...studentInput } = input;
      await assertUserWithEmailDoesNotExist(userInput.email, User);
      const userId = await User.insert({
        ...userInput,
        role: 'student',
      });
      const studentId = await Student.insert({
        userId,
        ...studentInput,
        name: studentInput.name || userInput.email,
      });
      return Student.findOneById(studentId);
    },

    async updateStudent(root, { id: studentId, input }, { authedUser, Student, User }) {
      const userId = await assertAuthenticatedUserIsAuthorizedToUpdateStudent(authedUser, studentId, Student)
      const { user: userInput, ...studentInput } = input;
      const user = await User.findOneById(userId);
      if (userInput.email !== user.email) {
        await assertUserWithEmailDoesNotExist(userInput.email, User);
      }
      await User.updateById(userId, userInput);
      await Student.updateById(studentId, studentInput);
      return Student.findOneById(studentId);
    },

    async updateNewStudent(root, { input }, { Student, User }) {
      const { email, password } = input.user;
      const { _id: userId } = await User.findOneByEmail(email);
      const { _id: studentId, changePasswordRequired } = await Student.findOneByUserId(userId);
      await assertChangePasswordIsRequired(changePasswordRequired);
      await User.updateById(userId, { password, email });
      await Student.updateById(studentId, { changePasswordRequired: false });
      return Student.findOneById(studentId);
    },

    async removeStudent(root, { id: studentId }, { authedUser, Student, User }) {
      const userId = await assertAuthenticatedUserIsAuthorizedToRemoveStudent(authedUser, studentId, Student)
      const userRemoved = await User.removeById(userId);
      const studentRemoved = await Student.removeById(studentId);
      return userRemoved && studentRemoved;
    },

    async createAccountForStudent(root, { input }, context) {
      const { authedUser, Teacher, Course, User } = context
      const { name, courseId, user } = input;
      const { email, ...rest } = user
      const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
      const course = await Course.findOneById(ObjectId(courseId));
      await assertAuthenticatedUserIsAuthorizedToUpdateCourse(teacherId, course);
      const username = await createUniqueUsernameForNewStudent(user.firstName, user.lastName, course.name, User);
      return resolvers.Mutation.createStudent(root, {
        input: {
          name,
          coursesIds: [ObjectId(courseId)],
          user: {
            email: username,
            ...rest,
          },
          changePasswordRequired: true,
        }
      }, context);
    },

    async removeStudentFromCourse(root, { studentId, courseId }, { authedUser, Course, Student, Teacher }) {
      const { _id: teacherId } = await Teacher.findOneByUserId(authedUser.userId);
      const course = await Course.findOneById(ObjectId(courseId));
      await assertAuthenticatedUserIsAuthorizedToUpdateCourse(teacherId, course); 
      const { coursesIds } = await Student.findOneById(studentId);
      await Student.updateById(studentId, {
        coursesIds: coursesIds
          ? coursesIds.filter((id) => !id.equals(courseId))
          : []
      });
      return true;
    }
  },
};

export default resolvers;
