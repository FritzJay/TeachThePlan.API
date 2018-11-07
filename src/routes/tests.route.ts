import { Router, Request, Response } from 'express'
import { getAvailableTests, newTest, gradeTest, submitTest } from '../library/tests/tests'
import { IQuestion } from '../library/tests/tests'
import { authorizeUser } from '../library/authentication/authentication'
import { getClassesByStudentID } from '../library/classes/classes';
import { getStudentByUserID } from '../library/students/students';

export let testsRouter = Router()

/*
  Return a list of available tests

  Authorization: student
*/
testsRouter.get('/available', async (request: Request, response: Response) => {
  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'student')
  
    const availableTests = await getAvailableTests(_id)
    
    response.status(200).json({
      success: 'Available tests were found',
      availableTests
    })
  }

  catch (error) {
    console.log('Error ocurred in tests/available', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  Returns a new test with empty questions

  Authorization: student

  Request.body {
    classID,
    number,
    operator,
  }
*/
testsRouter.post('/new', async (request: Request, response: Response) => {
  const { number, operator } = request.body // Temp: Use the given classID

  try {
    const user = await authorizeUser(request.headers.authorization, 'student')

    const student = await getStudentByUserID(user._id)

    const classes = await getClassesByStudentID(student._id)
    
    const cls = classes[0] //Temp: grab the first class

    if (!cls.studentIDs.some((id) => id.equals(student._id))) {
      throw new Error('Student is not a part of the given class')
    }

    const test = await newTest(cls._id, number, operator)

    response.status(200).json({
      success: 'Test was created',
      test,
    })

  } catch (error) {
    console.log('Error ocurred during test/new', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

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
testsRouter.post('/grade', async (request: Request, response: Response) => {
  try {
    const { duration, start, end } = request.body

    const { _id } = await authorizeUser(request.headers.authorization, 'student')

    const test = {
      userID: _id,
      duration: duration,
      start: new Date(start),
      end: new Date(end),
      questions: getQuestionsFromRequest(request),
    }

    const testResults = await gradeTest(test)

    await submitTest(test)

    response.status(200).json({
      success: 'Test was submitted',
      testResults,
    })
  
  } catch (error) {
    console.log('Error ocurred in tests/grade', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

const getQuestionsFromRequest = (request: Request): IQuestion[] => {
  return request.body.questions.map((q): IQuestion => {
    return {
      question: q.question,
      studentAnswer: q.studentAnswer,
      start: new Date(q.start),
      end: new Date(q.end)
    }
  })
}
