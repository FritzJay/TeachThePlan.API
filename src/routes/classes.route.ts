import { Router, Request, Response } from 'express'
import { createClass } from '../library/classes/classes'
import { authorizeUser } from '../library/authentication/authentication'
import { getTeacherByUserID } from '../library/teachers/teachers';

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
  const { classCode, grade, name, students } = request.body

  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')

    const teacher = await getTeacherByUserID(_id)

    const newClass = await createClass({
      classCode,
      grade,
      name,
      studentIDs: students,
    },
      teacher._id
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
