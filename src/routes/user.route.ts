import { Router, Request, Response } from 'express'
import { IUserModel } from '../models/user.model'
import { createUser, getUserByEmail } from '../library/users/users'
import { comparePasswords, createToken } from '../library/authentication/authentication'

export let userRouter = Router()

/*
  Creates a new user

  Authorization: None

  Request.body {
    email,
    password,
    firstName,
    lastName,
    userType
  }
*/
userRouter.post('/create', async (request: Request, response: Response) => {
  try {
    const { email, password, firstName, lastName, userType } = request.body

    const user = await createUser({
      email,
      password,
      firstName,
      lastName,
      userType,
    })

    response.status(200).json({
      success: 'User successfully created',
      user,
    })

  } catch(error) {
    console.log('Error ocurred in users/create', error)
    response.status(500).json({
      error: error.toString()
    })
  }

})

/*
  Creates a new session for a user

  Authorization: None

  request.body {
    email,
    password
  }
*/
userRouter.post('/signin', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body
  
    const user = await getUserByEmail(email)
  
    const passwordMatch = await comparePasswords(password, user.password)
      
    if (passwordMatch) {
      const token = await createToken(user)
  
      response.status(200).json({
        success: "Authenticated",
        token: token,
        user: {
          name: user.displayName,
          userType: user.userType,
          email: user.email,
        }
      })
  
    } else {
      response.status(401).json({
        error: "Invalid credentials provided."
      })
    }

  } catch(error) {
    console.log('Error ocurred in users/signin', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})
