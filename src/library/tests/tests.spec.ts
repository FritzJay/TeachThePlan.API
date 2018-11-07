import { ITest, IQuestion, ITestResults } from '../../library/tests/tests'
import { ITestParameters } from '../../library/testParameters/testParameters'
import * as Tests from "./tests"

const VALID_TEST_PARAMETERS: Tests.INewTestParameters = {
  operator: '+',
  number: 5,
  duration: 75,
}

describe('gradeTest', () => {
  const now = new Date(Date.now())
  const later = new Date(Date.now() + 10000)
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
    ]
    const test: ITest = {
      duration: 75,
      start: now,
      end: now,
      questions: questions,
    }
    beforeEach(() => {
      for (let question of test.questions) {
        question.correctAnswer = null
      }
    })
    it('returns the total number of questions', (done) => {
      Tests.gradeTest(test)
    .then((testResults: ITestResults) => {
      expect(testResults.total).toEqual(questions.length)
      done()
    })
  })
  
  it('returns needed as PASSING_PERCENTAGE of the total number of questions', (done) => {
    Tests.gradeTest(test)
    .then((testResults: ITestResults) => {
      expect(testResults.needed).toEqual(Math.round(questions.length * Tests.PASSING_PERCENTAGE))
      done()
    })
  })
  
  it('returns a count of the correctly answered questions', (done) => {
    Tests.gradeTest(test)
    .then((testResults: ITestResults) => {
      expect(testResults.correct).toEqual(3)
      done()
    })
  })
  
  it('returns one of the incorrectly answered questions as incorrect', (done) => {
    const incorrectlyAnsweredQuestions = questions.slice(3)
    Tests.gradeTest(test)
    .then((testResults: ITestResults) => {
      expect(incorrectlyAnsweredQuestions.includes(testResults.incorrect)).toBe(true)
      done()
    })
  })
  
  it('returns the question with the minimum difference between start and stop as the quickest answered', (done) => {
    Tests.gradeTest(test)
    .then((testResults: ITestResults) => {
      expect(testResults.quickest).toEqual(questions[0])
      done()
    })
  })
  
  it('sets the correct answer of each question', (done) => {
    Tests.gradeTest(test)
    .then((testResults: ITestResults) => {
      expect(testResults).not.toBeNull
      for (let question in test.questions) {
        expect(question).not.toBeNull
      }
      done()
    })
  })
})

describe('assertNewTestArgumentsAreValid', () => {
  let testParameters: Tests.INewTestParameters
  beforeEach(() => {
    testParameters = { ...VALID_TEST_PARAMETERS }
  })
  it('does not throw errors when given valid parameters', () => {
    Tests.assertNewTestArgumentsAreValid(testParameters)
  })

  it('throws an error for each invalid argument', () => {
    testParameters.operator = '%'
    testParameters.number = -5
    try {
      Tests.assertNewTestArgumentsAreValid(testParameters)
    } catch (errors) {
      expect(errors).toHaveLength(2)
    }
  })
})

describe('createQuestions', () => {
  it('returns the correct number of questions', () => {
    const questions: IQuestion[] = Tests.createQuestions('+', 5, 20, 5)
    expect(questions.length).toBe(25)
  })
  
  it('returns questions with a maximum number of 12', () => {
    const operator = '-'
    const questions: IQuestion[] = Tests.createQuestions(operator, 10, 20, 10)
    for (let q of questions) {
      let [num1, num2] = q.question.split(` ${operator} `)
      expect(parseInt(num1)).toBeLessThanOrEqual(12)
      expect(parseInt(num2)).toBeLessThanOrEqual(12)
    }
  })
})

describe('setCorrectAnswers', () => {
  const test = () => {
    return {
      questions: [
        {
          question: '1 + 1',
          correctAnswer: undefined,
          studentAnswer: 2,
        },
        {
          question: '1 + 2',
          correctAnswer: undefined,
          studentAnswer: 2,
        },
      ],
    }
  }
  it('sets correctAnswer on each question', () => {
    const testInstance = test()
    Tests.setCorrectAnswers(testInstance)
    for (let question of testInstance.questions) {
      expect(question.correctAnswer).not.toBeUndefined()
    }
  })

  it('returns the number of correct questions', () => {
    expect(Tests.setCorrectAnswers(test())).toBe(1)
  })
})

describe('getRandomIncorrectlyAnsweredQuestion', () => {
  const correctQuestion = {
    question: '1 + 2',
    studentAnswer: 3,
    correctAnswer: 3,
  }
  const incorrectQuestion = {
    question: '2 + 2',
    studentAnswer: 3,
    correctAnswer: 4,
  }
  const undefinedQuestion = {
    question: '2 + 2',
    studentAnswer: undefined,
    correctAnswer: 4,
  }

  it('returns an incorrectly answered question', () => {
    const test = {
      questions: [correctQuestion, incorrectQuestion]
    }
    expect(Tests.getRandomIncorrectlyAnsweredQuestion(test)).toBe(incorrectQuestion)
  })
  
  it('returns undefined if all answers are correct', () => {
    const test = {
      questions: [correctQuestion, correctQuestion]
    }
    expect(Tests.getRandomIncorrectlyAnsweredQuestion(test)).toBeUndefined()
  })

  it('treats undefined student answers as incorrect', () => {
    const test = {
      questions: [undefinedQuestion],
    }
    expect(Tests.getRandomIncorrectlyAnsweredQuestion(test)).toBe(undefinedQuestion)
  })

  it('prioritizes incorrectly answered questions over skipped questions', () => {
    const test = {
      questions: [
        undefinedQuestion,
        incorrectQuestion
      ],
    }
    for (let i = 0; i < 10; i++) {
      expect(Tests.getRandomIncorrectlyAnsweredQuestion(test)).toBe(incorrectQuestion)
    }
  })
})

describe('getQuickestAnsweredQuestion', () => {
  const slowQuestion = {
    start: new Date(),
    end: new Date(Date.now() + 1000),
    question: '1 + 1',
    correctAnswer: 2,
    studentAnswer: 2,
  }
  const quickestQuestion = {
    start: new Date(),
    end: new Date(),
    question: '1 + 1',
    correctAnswer: 2,
    studentAnswer: 2,
  }
  const incorrectQuestion = {
    start: new Date(),
    end: new Date(),
    question: '1 + 1',
    correctAnswer: 2,
    studentAnswer: 1,
  }
  it('returns the quickest answered question', () => {
    const test = {
      questions: [slowQuestion, quickestQuestion],
    }
    expect(Tests.getQuickestAnsweredQuestion(test)).toEqual(quickestQuestion)
  })
  
  it('returns only correctly answered questions', () => {
    const test = {
      questions: [slowQuestion, incorrectQuestion],
    }
    expect(Tests.getQuickestAnsweredQuestion(test)).toEqual(slowQuestion)
  })

  it('returns undefined if there are no correctly answered questions', () => {
    const test = {
      questions: [incorrectQuestion],
    }
    expect(Tests.getQuickestAnsweredQuestion(test)).toBeUndefined()
  })
})

describe('createFormattedQuestion', () => {
  it('does not flip numbers when the operator is subtract', () => {
    const operator = '-'
    const num1 = 2
    const num2 = 1
    let expectedQuestion = {
      question: `${num1} ${operator} ${num2}`
    }
    for (let i = 0; i < 25; i++) {
      expect(Tests.createFormattedQuestion(operator, num1, num2)).toEqual(expectedQuestion)
    }
  })

  it('multiplies the second number by the first when the operator is division', () => {
    const operator = '/'
    const num1 = 2
    const num2 = 1
    let expectedQuestion = {
      question: `${num1} ${operator} ${num2 * num1}`
    }
    expect(Tests.createFormattedQuestion(operator, num1, num2)).toEqual(expectedQuestion)
  })
})

describe('createFormattedQuestion', () => {
  it('randomly changes the order of the numbers if operator is not one of / or -', () => {
    let orderHasChanged = false
    for (let i = 0; i < 100; i++) {
      const numbers = Tests.createFormattedQuestion('+', 1, 2).question.split(' + ')
      if (parseInt(numbers[0], 10) == 2) {
        orderHasChanged = true
        break
      }
    }
    expect(orderHasChanged).toBeTruthy()
  })
})

describe('incrementOrResetAt', () => {
  const max = 10
  it('increments when number is less than max', () => {
    expect(Tests.incrementOrResetAt(5, max)).toBe(6)
  })

  it('resets to zero when number is >= max', () => {
    expect(Tests.incrementOrResetAt(max, max)).toBe(0)
  })
})
