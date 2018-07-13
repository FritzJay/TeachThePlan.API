import { Router, Request, Response } from 'express';
import { getAvailableTests, newTest, gradeTest, IAvailableTests, submitTest } from '../library/tests/tests';
import { ITestParameters } from '../library/testParameters/testParameters';
import { ITest, IQuestion } from '../library/tests/tests';
import { authorizeUser } from '../library/authentication/authentication';

export let testsRouter = Router();

/*
  Return a list of available tests

  Authorization: TODO
*/
testsRouter.get('/available', (request: Request, response: Response): void => {
  authorizeUser(request.headers.authorization, 'Type', (errors, user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    }
    else {
      return getAvailableTests(user, (errors: Error[], availableTests: IAvailableTests) => {
        if (errors) {
          return response.status(401).json({
            error: errors.toString()
          });
        } else {
          return response.status(200).json({
            availableTests: availableTests
          });
        }
      });
    }
  });
});

/*
  Returns a new test with empty questions

  Authorization: TODO

  Request.body {
    operator,
    number,
    questions,
    randomQuestions,
    duration
  }
*/
testsRouter.post('/new', (request: Request, response: Response): void => {
  authorizeUser(request.headers.authorization, 'Type', (errors, _user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    } else {
      const testParameters: ITestParameters = {
        operator: request.body.operator,
        number: request.body.number,
        questions: request.body.questions,
        randomQuestions: request.body.randomQuestions,
        duration: request.body.duration,
      };
      newTest(testParameters, (errors, test: ITest) => {
        if (errors) {
          return response.status(401).json({
            error: errors.toString()
          });
        } else {
          return response.status(200).json(test);
        }
      });
    }
  });
});

/*
  Returns a graded version of a given test

  Authorization: TODO

  Request.body {
    duration,
    start,
    end,
    questions
  }
*/
testsRouter.post('/grade', (request: Request, response: Response): void => {
  authorizeUser(request.headers.authorization, 'Type', (errors, user) => {
    if (errors) {
      return response.status(401).json({
        error: errors.toString()
      });
    } else {
      const test: ITest = {
        userID: user.id,
        duration: request.body.duration,
        start: new Date(request.body.start),
        end: new Date(request.body.start),
        questions: getQuestionsFromRequest(request),
      }
      gradeTest(test, (errors, testResults: ITest) => {
        if (errors) {
          return response.status(500).json({
            error: errors.toString()
          });
        } else {
          submitTest(test, (errors, _submit: ITest) => {
            if (errors) {
              return response.status(500).json({
                error: errors.toString()
              });
            } else {
              return response.status(200).json(testResults);
            }
          });
        }
      });
    }
  });
});

const getQuestionsFromRequest = (request: Request): IQuestion[] => {
  return request.body.questions.map((q): IQuestion => {
    return {
      question: q.question,
      studentAnswer: q.studentAnswer,
      start: new Date(q.start),
      end: new Date(q.end)
    }
  });
}
