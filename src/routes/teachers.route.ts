import { Router, Request, Response } from 'express'
import { createTeacher, getTeacherByUserID, getTeacherByEmail } from '../library/teachers/teachers'
import { authorizeUser, createToken, comparePasswords } from '../library/authentication/authentication'
import { Class } from '../models/class.model'
import { getUserByID } from '../library/users/users'

export let teachersRouter = Router()

/*
  Creates a new teacher

  Authorization: administrator

  Request.body {
    schoolName,
    user,
    displayName,
    classIDs?
  }
*/
teachersRouter.post('/create', async (request: Request, response: Response) => {
  try {
    const { userID, displayName, classIDs, schoolName } = request.body
  
    await authorizeUser(request.headers.authorization, 'administrator')
  
    const teacher = await createTeacher(
    {
        userID,
        displayName,
        classIDs,
      },
      schoolName
    )
  
    response.status(200).json({
      success: 'Teacher was successfully created!',
      teacher: teacher
    })

  } catch (error) {
    console.log('Error ocurred in teachers/create', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  Creates a session for a teacher
  
  Authentication: None
{
      expiresIn: '2h'
    }
  Request.body {
    email,
    password
  }
*/
teachersRouter.post('/signin', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body

    const { userID, displayName } = await getTeacherByEmail(email)

    const user = await getUserByID(userID)

    const passwordsMatch = await comparePasswords(password, user.password)

    if (!passwordsMatch) {
      response.status(401).json({
        error: 'Incorrect password'
      })

    } else {
      const token = await createToken(user)

      response.status(200).json({
        success: "Authenticated",
        user: {
          name: displayName,
        },
        token,
      })
    }

  } catch (error) {
    console.log('Error ocurred in teachers/signin', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  Returns a list of classes owned by a teacher

  Authorization: teacher
*/
teachersRouter.get('/classes', async (request: Request, response: Response) => {
  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')
  
    const teacher = await getTeacherByUserID(_id)
  
    const classes = Class.find({ _id: { $in: teacher.classIDs } }).exec()
  
    response.status(200).json({
      success: 'Classes were found',
      classes
    })

  } catch (error) {
    console.log('Error ocurred in /classes', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})