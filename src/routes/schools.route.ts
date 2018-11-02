import { Router, Request, Response } from 'express'
import { ISchool, createSchool, getSchoolByName } from '../library/schools/schools'
import { authorizeUser } from '../library/authentication/authentication'

export let schoolsRouter = Router()

/*
  Creates a new school

  Authorization: administrator

  Request.body: {
    name,
    teachersIDs?
  }
*/
schoolsRouter.post('/create', async (request: Request, response: Response) => {
  try {
    await authorizeUser(request.headers.authorization, 'administrator')
  
    const school = await createSchool({
      name: request.body.name,
      teacherIDs: request.body.teachers
    })
  
    response.status(200).json({
      success: 'School was successfully created!',
      school: school
    })
  } catch (error) {
    console.log('Error ocurred in schools/create', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  Returns a school who's name matches `Request.body.name`

  Authorization: administrator

  Request.body {
    name
  }
*/
schoolsRouter.get('/getByName', (request: Request, response: Response) => {
  authorizeUser(request.headers.authorization, 'administrator')
  .then(() => {
    getSchoolByName(request.body.name)
    .then((school: ISchool) => {
      response.status(200).json({
        success: 'School was found!',
        school: school,
      })
    })
    .catch((error) => {
      return response.status(500).json({
        error: error.toString()
      })
    })
  })
  .catch((error) => {
    return response.status(401).json({
      error: error.toString()
    })
  })
})
