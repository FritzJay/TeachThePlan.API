import { Router, Request, Response } from 'express';
import { getAvailableTests, newTest, gradeTest, IAvailableTests, submitTest } from '../library/tests/tests';
import { getUserFromToken } from '../library/users/users';
import { ITestParameters } from '../library/testParameters/testParameters';
import { ITest, IQuestion } from '../library/tests/tests';

export let testsRouter = Router();

testsRouter.post('/available', (postRequest: Request, postResponse: Response): void => {
  getUserFromToken(postRequest.headers.authorization, (errors, user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    }
    else {
      return getAvailableTests(user, (errors: Error[], availableTests: IAvailableTests) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors.toString()
          });
        } else {
          return postResponse.status(200).json({
            availableTests: availableTests
          });
        }
      });
    }
  });
});

testsRouter.post('/new', (postRequest: Request, postResponse: Response): void => {
  getUserFromToken(postRequest.headers.authorization, (errors, _user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    } else {
      const testParameters: ITestParameters = testParametersFromRequest(postRequest);
      newTest(testParameters, (errors, test: ITest) => {
        if (errors) {
          return postResponse.status(401).json({
            error: errors.toString()
          });
        } else {
          return postResponse.status(200).json(test);
        }
      });
    }
  });
});

testsRouter.post('/grade', (postRequest: Request, postResponse: Response): void => {
  getUserFromToken(postRequest.headers.authorization, (errors, _user) => {
    if (errors) {
      return postResponse.status(401).json({
        error: errors.toString()
      });
    } else {
      const test: ITest = testFromRequest(postRequest);
      gradeTest(test, (errors, test: ITest) => {
        if (errors) {
          return postResponse.status(500).json({
            error: errors.toString()
          });
        } else {
          submitTest(test, (errors, submittedTest: ITest) => {
            if (errors) {
              return postResponse.status(500).json({
                error: errors.toString()
              });
            } else {
              return postResponse.status(200).json(submittedTest);
            }
          });
        }
      });
    }
  });
});

const testFromRequest = (request: Request): ITest => {
  const questions: IQuestion[] = request.body.questions.map((q): IQuestion => {
    return {
      question: q.question,
      studentAnswer: q.studentAnswer,
      start: new Date(q.start),
      end: new Date(q.end)
    }
  });
  return {
    duration: request.body.duration,
    start: new Date(request.body.start),
    end: new Date(request.body.start),
    questions: questions,
  }
}

const testParametersFromRequest = (request: Request): ITestParameters => {
  return {
    operator: request.body.operator,
    number: request.body.number,
    questions: request.body.questions,
    randomQuestions: request.body.randomQuestions,
    duration: request.body.duration,
  }
}
