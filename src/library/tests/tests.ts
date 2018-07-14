import { Callback, ArgumentError } from "../common";
import { IUser } from "../users/users";
import { ITestParameters } from "../testParameters/testParameters";
import { Test, ITestModel } from "../../models/test.model";
import * as mathjs from "mathjs";

export const OPERATORS: string[] = ['+', '-', '*', '/'];
export const NUMBERS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const MAX_NUMBER = 12;

export interface IAvailableTests {
  operators: string[],
  numbers: number[],
}

export interface ITest {
  userID?: string;
  duration?: number;
  start?: Date;
  end?: Date;
  questions: IQuestion[];
}

export interface IQuestion {
  question: string;
  studentAnswer?: number;
  correctAnswer?: number;
  start?: Date;
  end?: Date;
}

export interface ITestResults {
  total: number;
  needed: number;
  correct: number;
  incorrect: IQuestion;
  quickest: IQuestion;
}

export const getAvailableTests = (_user: IUser, callback: Callback): void => {
  // Temporarily return all tests
  const availableTests: IAvailableTests = {
    operators: OPERATORS,
    numbers: NUMBERS
  }
  callback(availableTests);
}

export const newTest = (params: ITestParameters, callback: Callback): void => {
  validateNewTestArguments(params);
  const questions: IQuestion[] = createQuestions(params.operator, params.number, params.questions, params.randomQuestions);
  const test: ITest = {
    duration: params.duration,
    start: null,
    end: null,
    questions: questions,
  }
  callback(test);
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
  callback(testResults);
}

export const submitTest = (test: ITest, callback: Callback): void => {
  if (!test.userID) {
    throw 'Unable to save test to database because there was no user assigned';
  }
  new Test({
    userID: test.userID,
    duration: test.duration,
    start: test.start,
    end: test.end,
    questions: test.questions,
  })
  .save()
  .then((newTest: ITestModel) => {
    callback(newTest);
  });
}

const validateNewTestArguments = (params: ITestParameters): void => {
  let errors: ArgumentError[] = [];
  if (!OPERATORS.includes(params.operator)) {
    errors.push(new ArgumentError('operator', params.operator, `Must be one of ${OPERATORS}.`));
  }
  if (params.number < 0 || params.number > 20) {
    errors.push(new ArgumentError('number', params.number, 'Must be in range 0-20'));
  }
  if (params.questions < 1) {
    errors.push(new ArgumentError('questions', params.questions, 'Must be greater than 1'));
  }
  if (params.randomQuestions < 0) {
    errors.push(new ArgumentError('randomQuestions', params.randomQuestions, 'Must be greater than 0'));
  }
  if (params.duration < 0) {
    errors.push(new ArgumentError('duration', params.duration, 'Must be greater than 0'));
  }
  if (errors.length > 0) {
    throw errors;
  }
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
    const randomNumberBetweenZeroAndMax = (Math.random() * (MAX_NUMBER + 1) | 0);
    formattedQuestions.push(createFormattedQuestion(operator, randomNumberBetweenZeroAndNumber, randomNumberBetweenZeroAndMax));
  }
  return formattedQuestions
}

export const setCorrectAnswers = (test: ITest): number => {
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
