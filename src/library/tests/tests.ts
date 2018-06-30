import { IUser } from "../../interfaces/user";
import { ITest, ITestResults, IQuestion } from "../../interfaces/test";
import { ITestParameters } from "../../interfaces/testParameters";

export interface IAvailableTests {
  operators: string[],
  numbers: number[],
}

export const getAvailableTests = (user: IUser): IAvailableTests => {
  return {
    operators: ['+', '-', '*', '/'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
  }
}

export const newTest = (params: ITestParameters): ITest => {
  let questions: Array<IQuestion> = new Array<IQuestion>();
  return {
    duration: 70,
    start: new Date('1968-11-16T00:00:00'),
    end: new Date('1968-11-16T00:00:00'),
    questions: questions,
  }
}

export const gradeTest = (test: ITest): ITestResults => {
  return {
    total: 20,
    needed: 20,
    correct: ['sample question'],
    incorrect: 'sample question',
    quickest: 'sample question',
  }
}