import { Router, Request, Response } from 'express'
import { createParent } from '../library/parents/parents';

export let parentRouter = Router()

/*
  Creates a new parent

  Request.body {
    email,
    password
  }
*/
parentRouter.post('/create', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body
    
    const parent = await createParent({ email, password })
  
    response.status(200).json({
      success: 'Parent was successfully created!',
      parent
    })

  } catch (error) {
    console.log('Error ocurred in parent/create', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})