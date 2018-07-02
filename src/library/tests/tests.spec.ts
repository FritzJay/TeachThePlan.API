import { ITest, IQuestion, ITestResults } from '../../interfaces/test';
import { IUser } from '../../interfaces/user';
import { ITestParameters } from '../../interfaces/testParameters';
import { Callback } from '../../interfaces/callback';
import * as Tests from "./tests";

const VALID_TEST_PARAMETERS: ITestParameters = {
  operator: '+',
  number: 5,
  questions: 20,
  randomQuestions: 5,
  duration: 75,
}

describe('getAvailableTests', () => {
  it('returns all available tests', (done) => {
    const user: IUser = {
      firstName: "test",
      lastName: "user"
    };
    const callback: Callback = (error, availableTests: ITestParameters) => {
      expect(availableTests).toEqual({
        operators: Tests.OPERATORS,
        numbers: Tests.NUMBERS,
      });
      expect(error).not.toBeNull;
      done();
    };
    Tests.getAvailableTests(user, callback);
  });
});

describe('newTest', () => {
  let testParameters: ITestParameters;
  beforeEach(() => {
    testParameters = { ...VALID_TEST_PARAMETERS }
  });

  it('returns a test when given valid arguments', (done) => {
    const callback: Callback = (error, test: ITest) => {
      expect(error).toBeNull;
      expect(test).not.toBeNull;
      done();
    };
    Tests.newTest(testParameters, callback);
  });

  it('returns an error for each invalid argument', (done) => {
    testParameters.operator = '%';
    testParameters.number = -5;
    testParameters.questions = 0;
    testParameters.randomQuestions = -1;
    testParameters.duration = -75;
    const callback: Callback = (error, test) => {
      expect(error.length).toBe(5);
      expect(test).toBeNull;
      done();
    }
    Tests.newTest(testParameters, callback);
  });
});

describe('gradeTest', () => {
  const now = new Date(Date.now());
  const later = new Date(Date.now() + 10000);
  const questions: IQuestion[] = [
      {
        question: '1 + 1',
        studentAnswer: 2,
        start: now,
        end: now,
      },
      {
        question: '1 + 2',
        studentAnswer: 3,
        start: now,
        end: later,
      },
      {
        question: '1 + 3',
        studentAnswer: 4,
        start: now,
        end: later,
      },
      {
        question: '1 + 4',
        studentAnswer: 4,
        start: now,
        end: later,
      },
      {
        question: '1 + 5',
        studentAnswer: 4,
        start: now,
        end: later,
      }
    ];
  const test: ITest = {
    duration: 75,
    start: now,
    end: now,
    questions: questions,
  }
  beforeEach(() => {
    for (let question of test.questions) {
      question.correctAnswer = null;
    }
  });
  it('returns the total number of questions', (done) => {
    const callback: Callback = (error, testResults: ITestResults) => {
      expect(error).toBeNull;
      expect(testResults.total).toEqual(questions.length);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns needed as 80% of the total number of questions', (done) => {
    const callback: Callback = (error, testResults: ITestResults) => {
      expect(error).toBeNull;
      expect(testResults.needed).toEqual(Math.round(questions.length * 0.8));
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns a count of the correctly answered questions', (done) => {
    const callback: Callback = (error, testResults: ITestResults) => {
      expect(error).toBeNull;
      expect(testResults.correct).toEqual(3);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns one of the incorrectly answered questions as incorrect', (done) => {
    const incorrectlyAnsweredQuestions = questions.slice(3);
    const callback: Callback = (error, testResults: ITestResults) => {
      expect(error).toBeNull;
      expect(incorrectlyAnsweredQuestions.includes(testResults.incorrect)).toBe(true);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns the question with the minimum difference between start and stop as the quickest answered', (done) => {
    const callback: Callback = (error, testResults: ITestResults) => {
      expect(error).toBeNull;
      expect(testResults.quickest).toEqual(questions[0]);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('sets the correct answer of each question', (done) => {
    const callback: Callback = (error, testResults: ITestResults) => {
      expect(error).toBeNull;
      expect(testResults).not.toBeNull;
      for (let question in test.questions) {
        expect(question).not.toBeNull;
      }
      done();
    }
    Tests.gradeTest(test, callback);
  });
});

describe('createQuestions', () => {
  it('returns the correct number of questions', () => {
    const questions: IQuestion[] = Tests.createQuestions('+', 5, 20, 5)
    expect(questions.length).toBe(25);
  });

  it('returns questions with a maximum number of 12', () => {
    const operator = '-'
    const questions: IQuestion[] = Tests.createQuestions(operator, 10, 20, 10)
    for (let q of questions) {
      let [num1, num2] = q.question.split(` ${operator} `);
      expect(parseInt(num1)).toBeLessThanOrEqual(12);
      expect(parseInt(num2)).toBeLessThanOrEqual(12);
    }
  });
});