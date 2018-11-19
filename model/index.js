import Course from './Course';
import Parent from './Parent';
import Question from './Question';
import Student from './Student';
import Teacher from './Teacher';
import Test from './Test';
import TestParameters from './TestParameters';
import User from './User';
import TestResults from './TestResults';
import CourseInvitation from './CourseInvitation';

const models = {};

export default function addModelsToContext(context) {
  const newContext = Object.assign({}, context);
  Object.keys(models).forEach((key) => {
    newContext[key] = new models[key](newContext);
  });
  return newContext;
}

models.User = User;

models.Parent = Parent;

models.Question = Question;

models.Student = Student;

models.Teacher = Teacher;

models.Test = Test;

models.TestParameters = TestParameters;

models.Course = Course;

models.TestResults = TestResults;

models.TestResults = TestResults;

models.CourseInvitation = CourseInvitation;
