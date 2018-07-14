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
  try {
    authorizeUser(request.headers.authorization, 'Type', (user) => {
      getAvailableTests(user, (availableTests: IAvailableTests) => {
        response.status(200).json({
          availableTests: availableTests
        });
      });
    });
  } catch (error) {
    response.status(401).json({
      error: error
    });
  }
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
  try {
    authorizeUser(request.headers.authorization, 'Type', (user) => {
      const testParameters: ITestParameters = {
        operator: request.body.operator,
        number: request.body.number,
        questions: request.body.questions,
        randomQuestions: request.body.randomQuestions,
        duration: request.body.duration,
      };
      newTest(testParameters, user._id, (test: ITest) => {
        response.status(200).json(test);
      });
    });
  } catch (error) {
    response.status(401).json({
      error: error
    });
  }
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
  try {
    authorizeUser(request.headers.authorization, 'Type', (user) => {
      const test: ITest = {
        userID: user.id,
        duration: request.body.duration,
        start: new Date(request.body.start),
        end: new Date(request.body.start),
        questions: getQuestionsFromRequest(request),
      }
      try {
        gradeTest(test, (testResults: ITest) => {
          submitTest(test, (_submit: ITest) => {
            return response.status(200).json(testResults);
          });
        });
      } catch (error) {
        response.status(500).json({
          error: error
        });
      }
    });
  } catch (error) {
    response.status(401).json({
      error: error
    });
  }
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
