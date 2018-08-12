import { ArgumentError } from "../common";
import { ITestParameters } from "../testParameters/testParameters";
import { Test, ITestModel } from "../../models/test.model";
import * as mathjs from "mathjs";
import { Types } from "mongoose";
import { TestParameters } from "../../models/testParameters.model";

export const OPERATORS: string[] = ['+', '-', '*', '/'];
export const NUMBERS: ITestNumber[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => {
  return {
    number: n,
    operators: OPERATORS
  }
});
export const MAX_NUMBER = 12;
export const PASSING_PERCENTAGE = 0.9;

export interface ITestNumber {
  number: number;
  operators: string[];
}

export interface IAvailableTests {
  numbers: ITestNumber[];
}

export interface ITest {
  userID?: Types.ObjectId;
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

export const getAvailableTests = (userID: string): Promise<IAvailableTests> => {
  console.log('Getting available tests for userID');
  console.log(`userID: ${userID}`);
  return new Promise((resolve, _reject) => {
    // Temporarily return all tests
    const availableTests: IAvailableTests = {
      numbers: NUMBERS
    }
    resolve(availableTests);
  });
}

export const newTest = (params: ITestParameters, userID: string): Promise<ITest> => {
  console.log('Creating a new test');
  console.log(`userID: ${userID}`);
  console.log(TestParameters);
  return new Promise((resolve, reject) => {
    validateNewTestArguments(params)
    .then(() => {
      authorizeUserForNewTest(userID, params.number, params.operator)
      .then(() => {
        const questions: IQuestion[] = createQuestions(params.operator, params.number, params.questions, params.randomQuestions);
        const test: ITest = {
        duration: params.duration,
        start: null,
        end: null,
        questions: questions,
      }
      resolve(test);
      })
      .catch((error) => {
        reject(error);
      });
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const gradeTest = (test: ITest): Promise<ITestResults> => {
  console.log('Grading test');
  console.log(test);
  return new Promise((resolve, _reject) => {
    const numberOfCorrectAnswers: number = setCorrectAnswers(test);
    const incorrectQuestion: IQuestion = getRandomIncorrectlyAnsweredQuestion(test);
    const quickestQuestion: IQuestion = getQuickestAnsweredQuestion(test);
    const testResults: ITestResults = {
      total: test.questions.length,
      needed: Math.round(test.questions.length * PASSING_PERCENTAGE),
      correct: numberOfCorrectAnswers,
      incorrect: incorrectQuestion,
      quickest: quickestQuestion,
    }
    resolve(testResults);
  });
}

export const submitTest = (test: ITest): Promise<ITestModel> => {
  console.log('Submitting test');
  console.log(test);
  return new Promise((resolve, reject) => {
    if (test.userID) {
      new Test({
        userID: test.userID,
        duration: test.duration,
        start: test.start,
        end: test.end,
        questions: test.questions,
      })
      .save()
      .then((newTest: ITestModel) => {
        resolve(newTest);
      })
      .catch((error) => {
        reject(error);
      });
    } else {
      reject(new Error('Unable to save test to database because there was no user assigned'));
    }
  });
}

export const authorizeUserForNewTest = (userID: string, number: number, operator: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    getAvailableTests(userID)
    .then((availableTests: IAvailableTests) => {
      const matchingTestNumber = availableTests.numbers.find((testNumber: ITestNumber) => testNumber.number == number);
      if (!matchingTestNumber) {
        reject(new Error(`Student is not authorized to test the number '${number}`));
      }
      const operatorIsAvailable = matchingTestNumber.operators.includes(operator);
      if (!operatorIsAvailable) {
        reject(new Error(`Student is not authorized to test the operator '${operator}' for the number ${number}`));
      }
      resolve();
    })
    .catch((error) => {
      reject(error);
    });
  });
}

export const validateNewTestArguments = (params: ITestParameters): Promise<void> => {
  return new Promise((resolve, reject) => {
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
    if (errors.length == 0) {
      resolve();
    } else {
      reject(errors);
    }
  });
}

export const createQuestions = (operator: string, number: number, questions: number, randomQuestions: number): IQuestion[] => {
  let formattedQuestions: IQuestion[] = [];
  while (formattedQuestions.length < questions) {
    const secondNumber = formattedQuestions.length % MAX_NUMBER;
    const formattedQuestion = createFormattedQuestion(operator, number, secondNumber);
    formattedQuestions.push(formattedQuestion);
  }
  while (formattedQuestions.length < questions + randomQuestions) {
    const randomNumberBetweenZeroAndNumber = (Math.random() * (number + 1) | 0);
    const randomNumberBetweenZeroAndMax = (Math.random() * (MAX_NUMBER + 1) | 0);
    formattedQuestions.push(createFormattedQuestion(operator, randomNumberBetweenZeroAndNumber, randomNumberBetweenZeroAndMax));
  }
  return formattedQuestions
}

export const setCorrectAnswers = (test: ITest): number => {
  let numberOfCorrectAnswers = 0;
  for (let question of test.questions) {
    const studentAnswer = (question.studentAnswer) ? question.studentAnswer.toString() : ''
    question.correctAnswer = mathjs.eval(question.question);
    question.correctAnswer.toString() === studentAnswer && numberOfCorrectAnswers++; 
  }
  return numberOfCorrectAnswers;
};

export const getRandomIncorrectlyAnsweredQuestion = (test: ITest): IQuestion => {
  const incorrectlyAnsweredQuestions: IQuestion[] = test.questions.filter((q) => !isCorrect(q));
  return incorrectlyAnsweredQuestions[Math.floor(Math.random() * incorrectlyAnsweredQuestions.length)];
}

export const getQuickestAnsweredQuestion = (test: ITest): IQuestion => {
  const correctlyAnsweredQuestions = test.questions.filter((q) => isCorrect(q));
  if (correctlyAnsweredQuestions.length !== 0) {
    return correctlyAnsweredQuestions.reduce((a, b) => {
      const aDuration: number = a.end.getTime() - a.start.getTime();
      const bDuration: number = b.end.getTime() - b.start.getTime();
      return aDuration < bDuration ? a : b;
    });
  }
}

const isCorrect = (question: IQuestion): Boolean => {
  if(question.studentAnswer === undefined) {
    return false;
  }
  return question.correctAnswer.toString() === question.studentAnswer.toString();
}

export const createFormattedQuestion = (operator: string, firstNumber: number, secondNumber: number): IQuestion => {
  const numbers = [firstNumber, secondNumber];
  if (operator === '/') {
    numbers[1] = secondNumber * firstNumber;
  }
  const shufflingWontResultInFractionsOrNegatives = !['-', '/'].includes(operator)
  if (shufflingWontResultInFractionsOrNegatives) {
    numbers.sort(() => Math.random() - 0.5);
  } else {
    numbers.sort((a: number, b: number) => b - a);
  }
  return {
    question: `${numbers[0]} ${operator} ${numbers[1]}`,
  }
}

export const incrementOrResetAt = (number: number, max: number): number => {
  if (number < max) {
    return number + 1;
  } else {
    return 0;
  }
}
