import { IUser } from "../../interfaces/user";
import { Callback } from "../../interfaces/callback";
import { ITest, ITestResults, IQuestion } from "../../interfaces/test";
import { ITestParameters } from "../../interfaces/testParameters";

export const OPERATORS: string[] = ['+', '-', '*', '/'];
export const NUMBERS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export interface IAvailableTests {
  operators: string[],
  numbers: number[],
}

export const getAvailableTests = (user: IUser, callback: Callback): void => {
  const availableTests: IAvailableTests = {
    operators: OPERATORS,
    numbers: NUMBERS
  }
  callback(null, availableTests);
}

export const newTest = (params: ITestParameters, callback: Callback): void => {
  const questions: Array<IQuestion> = new Array<IQuestion>();
  const test: ITest = {
    duration: 70,
    start: new Date('1968-11-16T00:00:00'),
    end: new Date('1968-11-16T00:00:00'),
    questions: questions,
  }
  callback(null, test);
}

export const gradeTest = (test: ITest, callback: Callback): void => {
  const testResults: ITestResults = {
    total: 20,
    needed: 20,
    correct: ['sample question'],
    incorrect: 'sample question',
    quickest: 'sample question',
  }
  callback(null, testResults);
}