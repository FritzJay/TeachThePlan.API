import { IUser } from "../../interfaces/user";
import { Callback } from "../../interfaces/callback";
import { ITest, ITestResults, IQuestion } from "../../interfaces/test";
import { ITestParameters } from "../../interfaces/testParameters";
import { TestArgumentError } from "../../library/errors";
import * as mathjs from "mathjs";
import { Test, ITestModel } from "../../models/test.model";

export const OPERATORS: string[] = ['+', '-', '*', '/'];
export const NUMBERS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const MAX_NUMBER = 12;

export interface IAvailableTests {
  operators: string[],
  numbers: number[],
}

export const getAvailableTests = (_user: IUser, callback: Callback): void => {
  // Temporarily return all tests
  const availableTests: IAvailableTests = {
    operators: OPERATORS,
    numbers: NUMBERS
  }
  callback(null, availableTests);
}

export const newTest = (params: ITestParameters, callback: Callback): void => {
  const argumentsErrors: Error[] = validateNewTestArguments(params, callback);
  if (argumentsErrors.length > 0) {
    callback(argumentsErrors, null);
    return
  }
  const questions: IQuestion[] = createQuestions(params.operator, params.number, params.questions, params.randomQuestions);
  const test: ITest = {
    duration: params.duration,
    start: null,
    end: null,
    questions: questions,
  }
  callback(null, test);
}

export const gradeTest = (test: ITest, callback: Callback): void => {
  const numberOfCorrectAnswers: number = setCorrectAnswers(test);
  const incorrectQuestion: IQuestion = getRandomIncorrectlyAnsweredQuestion(test);
  const quickestQuestion: IQuestion = getQuickestAnsweredQuestion(test);
  const testResults: ITestResults = {
    total: test.questions.length,
    needed: Math.round(test.questions.length * 0.8),
    correct: numberOfCorrectAnswers,
    incorrect: incorrectQuestion,
    quickest: quickestQuestion,
  }
  callback(null, testResults);
}

export const submitTest = (test: ITest, callback: Callback): void => {
  new Test({...test})
  .save((newTest: ITestModel) => {
    callback(null, newTest);
  })
  .catch((saveError: Error) => {
    callback([saveError], null);
  });
}

export const createQuestions = (operator: string, number: number, questions: number, randomQuestions: number): IQuestion[] => {
  let formattedQuestions: IQuestion[] = [];
  let questionsIndex;
  let secondNumberIndex = 0;
  for (questionsIndex = 0; questionsIndex < questions; questionsIndex++) {
    formattedQuestions.push(createFormattedQuestion(operator, number, secondNumberIndex));
    secondNumberIndex = incrementOrResetAt(secondNumberIndex, MAX_NUMBER);
  }
  let randomIndex;
  for (randomIndex = 0; randomIndex < randomQuestions; randomIndex++) {
    const randomNumberBetweenZeroAndNumber = (Math.random() * (number + 1) | 0);
    const randomNumberBetweenZeroAndTwenty = (Math.random() * (MAX_NUMBER + 1) | 0);
    formattedQuestions.push(createFormattedQuestion(operator, randomNumberBetweenZeroAndNumber, randomNumberBetweenZeroAndTwenty));
  }
  return formattedQuestions
}

const validateNewTestArguments = (params: ITestParameters, callback: Callback): Error[] => {
  let errors: TestArgumentError[] = [];
  if (!OPERATORS.includes(params.operator)) {
    errors.push(new TestArgumentError('operator', params.operator, `Must be one of ${OPERATORS}.`));
  }
  if (params.number < 0 || params.number > 20) {
    errors.push(new TestArgumentError('number', params.number, 'Must be in range 0-20'));
  }
  if (params.questions < 1) {
    errors.push(new TestArgumentError('questions', params.questions, 'Must be greater than 1'));
  }
  if (params.randomQuestions < 0) {
    errors.push(new TestArgumentError('randomQuestions', params.randomQuestions, 'Must be greater than 0'));
  }
  if (params.duration < 0) {
    errors.push(new TestArgumentError('duration', params.duration, 'Must be greater than 0'));
  }
  return errors;
}

const setCorrectAnswers = (test: ITest): number => {
  let numberOfCorrectAnswers = 0;
  for (let question of test.questions) {
    question.correctAnswer = mathjs.eval(question.question);
    question.correctAnswer.toString() === question.studentAnswer.toString() && numberOfCorrectAnswers++; 
  }
  return numberOfCorrectAnswers;
};

const getRandomIncorrectlyAnsweredQuestion = (test: ITest): IQuestion => {
  let incorrectlyAnsweredQuestions: IQuestion[] = [];
  for (let question of test.questions) {
    question.correctAnswer.toString() !== question.studentAnswer.toString() && incorrectlyAnsweredQuestions.push(question); 
  }
  return incorrectlyAnsweredQuestions[Math.floor(Math.random() * incorrectlyAnsweredQuestions.length)];
}

const getQuickestAnsweredQuestion = (test: ITest): IQuestion => {
  return test.questions.reduce((a, b) => {
    const aDuration: number = a.end.getTime() - a.start.getTime();
    const bDuration: number = b.end.getTime() - b.start.getTime();
    return aDuration < bDuration ? a : b;
  });
}

const createFormattedQuestion = (operator: string, firstNumber: Number, secondNumber: Number): IQuestion => {
  const [num1, num2] = shuffleArray([firstNumber, secondNumber]);
  return {
    question: `${num1} ${operator} ${num2}`,
  }
}

const shuffleArray = (array: any[]): any[] => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // eslint-disable-line no-param-reassign
  }
  return array;
}

const incrementOrResetAt = (number: number, max: number): number => {
  if (number < max) {
    return number + 1;
  } else {
    return 0;
  }
}
