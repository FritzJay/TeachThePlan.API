import { Router, Request, Response } from 'express'
import { createClass, deleteClass, updateClass } from '../library/classes/classes'
import { authorizeUser } from '../library/authentication/authentication'

export let classesRouter = Router()

/*
  Creates a new class

  Authorization: teacher

  Request.body {
    grade,
    name,
  }
*/
classesRouter.put('/', async (request: Request, response: Response) => {
  const { grade, name } = request.body

  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')

    const newClass = await createClass({
      grade,
      name,
    },
      _id
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

/*
  Updates a class

  Authorization: teacher

  Request.body {
    
  }
*/
classesRouter.patch('/', async (request: Request, response: Response) => {
  const { classID, updates } = request.body

  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')
    
    const cls = await updateClass(classID, { ...updates }, _id)

    response.status(200).json({
      success: 'Class successfully updated',
      class: cls
    })

  } catch(error) {

    console.log('Error ocurred in class/update', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  Deletes a class

  Authorization: teacher

  Request.body {
    classID
  }
*/
classesRouter.delete('/', async (request: Request, response: Response) => {
  const { classID } = request.body

  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')
    
    const cls = await deleteClass(classID, _id)

    response.status(200).json({
      success: 'Class successfully deleted',
      class: cls
    })

  } catch(error) {

    console.log('Error ocurred in class/delete', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

