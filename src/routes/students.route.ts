import { Router, Request, Response } from 'express'
import { IUserModel } from '../models/user.model'
import { getUserByID } from '../library/users/users'
import { IStudentModel, Student } from '../models/student.model'
import { createToken, authorizeUser, comparePasswords } from '../library/authentication/authentication'
import { getStudentByEmail, IStudent, createStudent } from '../library/students/students'

export let studentRouter = Router()

/*
  Creates a new student

  Authentication: teacher,

  Request.body {
    userID,
    displayName,
    classCode
  }
*/
studentRouter.post('/create', async (request: Request, response: Response) => {
  try {
    const { classCode, userID, displayName } = request.body

    await authorizeUser(request.headers.authorization, 'teacher')

    const student = await createStudent(
      {
        userID: userID,
        displayName: displayName,
      },
      classCode
    )

    response.status(200).json({
      success: 'Student successfully created!',
      student: student
    })

  } catch (error) {
    console.log('Error ocurred in student/create', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})

/*
  Creates a session for a student
  
  Authentication: None
{
      expiresIn: '2h'
    }
  Request.body {
    email,
    password
  }
*/
studentRouter.post('/signin', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body
  
    const student = await getStudentByEmail(email)

    const user = await getUserByID(student.userID)

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
          name: student.displayName,
        },
        token: token,
      })
    }

  } catch (error) {
    console.log('Error ocurred in students/signin', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})