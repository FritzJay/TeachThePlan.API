import { Router, Request, Response } from 'express'
import { createClass } from '../library/classes/classes'
import { authorizeUser } from '../library/authentication/authentication'

export let classesRouter = Router()

/*
  Creates a new class

  Authorization: teacher

  Request.body {
    classCode,
    studentIDs?
  }
*/
classesRouter.post('/create', async (request: Request, response: Response) => {
  try {
    const user = await authorizeUser(request.headers.authorization, 'teacher')

    const newClass = await createClass(
      {
        classCode: request.body.classCode,
        studentIDs: request.body.students,
      },
      user._id
    )

    response.status(200).json({
      success: 'Class was successfully created!',
      class: newClass,
    })

  } catch (error) {

    console.log('Error ocurred in class/create', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})
