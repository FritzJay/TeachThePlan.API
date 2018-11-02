import { Router, Request, Response } from 'express';
import { getAvailableTests, newTest, gradeTest, IAvailableTests, submitTest, ITestResults } from '../library/tests/tests';
import { ITestParameters, getTestParameters } from '../library/testParameters/testParameters';
import { ITest, IQuestion } from '../library/tests/tests';
import { authorizeUser } from '../library/authentication/authentication';

export let testsRouter = Router();

/*
  Return a list of available tests

  Authorization: student
*/
testsRouter.get('/available', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'student')
  .then((user) => {
    getAvailableTests(user._id)
    .then((availableTests: IAvailableTests) => {
      response.status(200).json({
        availableTests: availableTests
      });
    })
    .catch((error) => {
      response.status(401).json({
        error: error.toString()
      });
    });
  }).catch((error) => {
    response.status(401).json({
      error: error.toString()
    });
  });
});

/*
  Returns a new test with empty questions

  Authorization: student

  Request.body {
    operator,
    number,
    questions,
    randomQuestions,
    duration
  }
*/
testsRouter.post('/new', async (request: Request, response: Response) => {
  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'student')

    const testParameters = await getTestParameters(_id)
    testParameters.operator = request.body.operator;
    testParameters.number = request.body.number;

    const test = await newTest(testParameters, _id)
    response.status(200).json({ test })
  } catch (error) {
    console.log('Error ocurred during test/new', error)
    response.status(500).json({
      error: error.toString()
    })
  }
});

/*
  Returns a graded version of a given test

  Authorization: student

  Request.body {
    duration,
    start,
    end,
    questions
  }
*/
testsRouter.post('/grade', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'student')
  .then((user) => {
    const test: ITest = {
      userID: user.id,
      duration: request.body.duration,
      start: new Date(request.body.start),
      end: new Date(request.body.end),
      questions: getQuestionsFromRequest(request),
    }
    gradeTest(test)
    .then((testResults: ITestResults) => {
      submitTest(test)
      .then((_test: ITest) => {
        return response.status(200).json({testResults});
      })
      .catch((error) => {
        response.status(500).json({
          error: error.toString()
        });
      });
    })
    .catch((error) => {
      response.status(500).json({
        error: error.toString()
      });
    });
  })
  .catch((error) => {
    response.status(401).json({
      error: error.toString()
    });
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
