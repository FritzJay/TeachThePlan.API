import { ITest, IQuestion, ITestResults } from '../../library/tests/tests';
import { ITestParameters } from '../../library/testParameters/testParameters';
import { Callback } from '../../library/common';
import * as Tests from "./tests";

const VALID_TEST_PARAMETERS: ITestParameters = {
  operator: '+',
  number: 5,
  questions: 20,
  randomQuestions: 5,
  duration: 75,
}

describe('validateNewTestArguments', () => {
  let testParameters: ITestParameters;
  beforeEach(() => {
    testParameters = { ...VALID_TEST_PARAMETERS }
  });

  it('does not throw errors when given valid parameters', () => {
    Tests.validateNewTestArguments(testParameters)
  });

  it('throws an error for each invalid argument', () => {
    testParameters.operator = '%';
    testParameters.number = -5;
    testParameters.questions = 0;
    testParameters.randomQuestions = -1;
    testParameters.duration = -75;

    try {
      Tests.validateNewTestArguments(testParameters)
    } catch (errors) {
      expect(errors).toHaveLength(5);
    }
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
    const callback: Callback = (testResults: ITestResults) => {
      expect(testResults.total).toEqual(questions.length);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns needed as 80% of the total number of questions', (done) => {
    const callback: Callback = (testResults: ITestResults) => {
      expect(testResults.needed).toEqual(Math.round(questions.length * 0.8));
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns a count of the correctly answered questions', (done) => {
    const callback: Callback = (testResults: ITestResults) => {
      expect(testResults.correct).toEqual(3);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns one of the incorrectly answered questions as incorrect', (done) => {
    const incorrectlyAnsweredQuestions = questions.slice(3);
    const callback: Callback = (testResults: ITestResults) => {
      expect(incorrectlyAnsweredQuestions.includes(testResults.incorrect)).toBe(true);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('returns the question with the minimum difference between start and stop as the quickest answered', (done) => {
    const callback: Callback = (testResults: ITestResults) => {
      expect(testResults.quickest).toEqual(questions[0]);
      done();
    }
    Tests.gradeTest(test, callback);
  });

  it('sets the correct answer of each question', (done) => {
    const callback: Callback = (testResults: ITestResults) => {
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

describe('createFormattedQuestion', () => {
  it('does not flip numbers when the operator is subtract or divide', () => {
    let operator = '-';
    const num1 = 1;
    const num2 = 2;
    let expectedQuestion = {
      question: `${num1} ${operator} ${num2}`
    }
    for (let i = 0; i < 25; i++) {
      expect(Tests.createFormattedQuestion(operator, num1, num2)).toEqual(expectedQuestion);
    }
    operator = '/'
    expectedQuestion = {
      question: `${num1} ${operator} ${num2}`
    }
    for (let i = 0; i < 25; i++) {
      expect(Tests.createFormattedQuestion(operator, num1, num2)).toEqual(expectedQuestion);
    }
  });
});
