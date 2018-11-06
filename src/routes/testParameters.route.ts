import { Router, Request, Response } from 'express'
import { authorizeUser } from '../library/authentication/authentication'
import { createTestParameters, updateTestParameters, getTestParametersByClassID } from '../library/testParameters/testParameters';

export let testParametersRoute = Router()

/*
  TODO: Assert the user is a teacher that owns the class that testParameters.objectID refers to
  TODO: Assert the class that testParameters.objectID refers to doesn't already exist


  Creates new Test Parameters

  Authorization: student

  Request.body {
    objectID,
    duration,
    numbers,
    operators,
    questions,
    randomQuestions
  }
*/
testParametersRoute.put('/', async (request: Request, response: Response) => {
  const { objectID, duration, numbers, operators, questions, randomQuestions } = request.body

  try {
    await authorizeUser(request.headers.authorization, 'teacher')

    const testParameters = await createTestParameters({
      objectID,
      duration,
      numbers,
      operators,
      questions,
      randomQuestions,
    })

    response.status(200).json({
      success: 'Test Parameters were successfully created!',
      testParameters,
    })

  } catch (error) {
    console.log('Error ocurred during test-parameters/put', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  TODO: Verify user is the teacher that owns the class referred by classID

  Returns Test Parameters

  Authorization: student

  Request.params {
    classID
  }
*/
testParametersRoute.get('/:classID', async (request: Request, response: Response) => {
  const { classID } = request.params

  try {
    await authorizeUser(request.headers.authorization, 'teacher')

    const testParameters = await getTestParametersByClassID(classID)

    response.status(200).json({
      success: 'Test Parameters were successfully found!',
      testParameters,
    })

  } catch (error) {
    console.log('Error ocurred during test-parameters/get', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
Updates Test Parameters

  Authorization: student

  Request.body {
    testParametersID,
    updates: {
      duration,
      numbers,
      operators,
      questions,
      randomQuestions
    }
  }
*/
testParametersRoute.patch('/', async (request: Request, response: Response) => {
  const { testParametersID, updates } = request.body

  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')

    const testParameters = await updateTestParameters(testParametersID, updates, _id)

    response.status(200).json({
      success: 'Test Parameters were successfully updated!',
      testParameters,
    })

  } catch (error) {
    console.log('Error ocurred during test-parameters/patch', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})
