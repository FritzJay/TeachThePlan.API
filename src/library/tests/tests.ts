import { ArgumentError } from "../common"
import { getTestParametersForClass, IFormattedTestParameters } from "../testParameters/testParameters"
import { Test, ITestModel, ITest } from "../../models/test.model"
import * as mathjs from "mathjs"

export const OPERATORS = ['+', '-', '*', '/']
export const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
export const MAX_NUMBER = 12
export const PASSING_PERCENTAGE = 0.9

export interface IFormattedTest {
  id: string
  duration: number
  start?: Date
  end?: Date
  questions: IQuestion[]
}

export class FormattedTest {
  public model: ITestModel
  public formatted: IFormattedTest

  constructor(test: ITestModel) {
    this.model = test
    this.formatted = this.formatTest(test)
  }

  private formatTest = ({ _id, duration, start, end, questions }: ITestModel) => ({
    id: _id.toString(),
    duration,
    start,
    end,
    questions,
  })
}

export interface INewTestParameters {
  number: number
  operator: string
  duration
}

export interface IQuestion {
  question: string
  studentAnswer?: number
  correctAnswer?: number
  start?: Date
  end?: Date
}

export interface ITestResults {
  total: number
  needed: number
  correct: number
  incorrect: IQuestion
  quickest: IQuestion
}

export const createTest = async (testParameters: IFormattedTestParameters, number: number, operator: string): Promise<FormattedTest> => {
  const { duration, numbers, operators, questions, randomQuestions } = testParameters
  if (!numbers.includes(number)) {
    throw new Error(`You are not authorized for a new test with a number of ${number}`)
  }
  if (!operators.includes(operator)) {
    throw new Error(`You are not authorized for a new test with an operator of ${operator}`)
  }
  const newQuestions = createQuestions(operator, number, questions, randomQuestions)
  const test = await Test.create({
    duration,
    start: null,
    end: null,
    questions: newQuestions,
  })
  return new FormattedTest(test)
}

export const gradeTest = async (test: ITest): Promise<ITestResults> => {
  console.log('Grading test')
  console.log(test)

  const total = test.questions.length
  const needed = Math.round(test.questions.length * PASSING_PERCENTAGE)
  const correct: number = setCorrectAnswers(test)
  const incorrect: IQuestion = getRandomIncorrectlyAnsweredQuestion(test)
  const quickest: IQuestion = getQuickestAnsweredQuestion(test)
  
  return {
    total,
    needed,
    correct,
    incorrect,
    quickest,
  }
}

export const submitTest = async (test: ITest): Promise<ITestModel> => {
  console.log('Submitting test')
  console.log(test)

  const {userID, duration, start, end, questions } = test

  if (test.userID) {
    return await new Test({ userID, duration, start, end, questions, }).save()
  } else {
    console.log('Unable to save test to database because there was no user assigned')
    throw new Error('Unable to save test to database because there was no user assigned')
  }
}

export const createQuestions = (operator: string, number: number, questions: number, randomQuestions: number): IQuestion[] => {
  let formattedQuestions: IQuestion[] = []

  while (formattedQuestions.length < questions) {
    const secondNumber = formattedQuestions.length % MAX_NUMBER
    const formattedQuestion = createFormattedQuestion(operator, number, secondNumber)
    formattedQuestions.push(formattedQuestion)
  }

  while (formattedQuestions.length < questions + randomQuestions) {
    const randomNumberBetweenZeroAndNumber = (Math.random() * (number + 1) | 0)
    const randomNumberBetweenZeroAndMax = (Math.random() * (MAX_NUMBER + 1) | 0)
    formattedQuestions.push(createFormattedQuestion(operator, randomNumberBetweenZeroAndNumber, randomNumberBetweenZeroAndMax))
  }

  return formattedQuestions
}

export const setCorrectAnswers = (test: ITest): number => {
  let numberOfCorrectAnswers = 0

  for (let question of test.questions) {
    question.correctAnswer = mathjs.eval(question.question)
    
    if (isCorrect(question)) {
      numberOfCorrectAnswers++ 
    }
  }

  return numberOfCorrectAnswers
}

export const getRandomIncorrectlyAnsweredQuestion = (test: ITest): IQuestion => {
  const incorrectlyAnsweredQuestions: IQuestion[] = test.questions.filter((q) => !isCorrect(q))

  if (incorrectlyAnsweredQuestions.length > 0) {
    const answeredQuestions: IQuestion[] = incorrectlyAnsweredQuestions.filter((q) => !isSkipped(q))

    if (answeredQuestions.length > 0) {
      return answeredQuestions[Math.floor(Math.random() * answeredQuestions.length)]
    } else {
      return incorrectlyAnsweredQuestions[Math.floor(Math.random() * incorrectlyAnsweredQuestions.length)]
    }
  } else {
    return undefined
  }
}

export const getQuickestAnsweredQuestion = (test: ITest): IQuestion => {
  const correctlyAnsweredQuestions = test.questions.filter((q) => isCorrect(q))

  if (correctlyAnsweredQuestions.length !== 0) {
    return correctlyAnsweredQuestions.reduce((a, b) => {
      const aDuration: number = a.end.getTime() - a.start.getTime()
      const bDuration: number = b.end.getTime() - b.start.getTime()

      return aDuration < bDuration ? a : b
    })
  }
}

const isCorrect = (question: IQuestion): Boolean => {
  if (isSkipped(question)) {
    return false
  }

  return question.correctAnswer.toString() === question.studentAnswer.toString()
}

const isSkipped = (question: IQuestion): Boolean => {
  return question.studentAnswer === undefined || question.studentAnswer === null
}

export const createFormattedQuestion = (operator: string, firstNumber: number, secondNumber: number): IQuestion => {
  const numbers = [firstNumber, secondNumber]

  if (operator === '/') {
    numbers[1] = secondNumber * firstNumber
  }

  const shufflingWontResultInFractionsOrNegatives = !['-', '/'].includes(operator)
  if (shufflingWontResultInFractionsOrNegatives) {
    numbers.sort(() => Math.random() - 0.5)
  } else {
    numbers.sort((a: number, b: number) => b - a)
  }
  
  return {
    question: `${numbers[0]} ${operator} ${numbers[1]}`,
  }
}

export const incrementOrResetAt = (number: number, max: number): number => {
  if (number < max) {
    return number + 1
  } else {
    return 0
  }
}
