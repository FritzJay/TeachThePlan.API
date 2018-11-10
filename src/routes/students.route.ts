import { Router, Request, Response } from 'express'
import { getUserByID } from '../library/users/users'
import { createToken, comparePasswords, authorizeUser } from '../library/authentication/authentication'
import { getStudentByEmail, createStudent, getStudentsByIDs } from '../library/students/students'

export let studentRouter = Router()

/*
  Returns an array of students. One for each ID.

  Authorization: teacher

  Request.body {
    studentIDs
  }
*/
studentRouter.post('/getByIDs', async (request: Request, response: Response) => {
  const { studentIDs } = request.body

  try {
    const { _id } = await authorizeUser(request.headers.authorization, 'teacher')

    const students = await getStudentsByIDs(studentIDs, _id)

    response.status(200).json({
      success: 'Students were found',
      students,
    })

  } catch (error) {

    console.log('Error ocurred in students/getByIDs', error)
    response.status(500).json({
      error: error.toString()
    })
  }
})


/*
  Creates a new student

  Request.body {
    email,
    password
  }
*/
studentRouter.post('/create', async (request: Request, response: Response) => {
  try {
    const { email, password } = request.body
    
    const student = await createStudent({ email, password })
  
    response.status(200).json({
      success: 'Student was successfully created!',
      student
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