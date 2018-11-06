import { ITestParameters } from '../testParameters/testParameters'
import { TestParameters, ITestParametersModel } from '../../models/testParameters.model'
import { Types } from 'mongoose'
import { getTeacherByUserID, getTeacherByID } from '../teachers/teachers';
import { IUserModel } from '../../models/user.model';
import { ITeacherModel } from '../../models/teacher.model';

export interface ITestParameters {
  objectID: string
  duration: number
  operators: string[]
  numbers: number[]
  questions: number
  randomQuestions: number
}


const getTestParametersByID = async (testParametersID: string): Promise<ITestParametersModel> => {
  console.log('Getting test parameters by id', testParametersID)
  
  return await TestParameters.findById(testParametersID).exec()
}

const getTestParametersByClassIDs = async (classIDs: string[]): Promise<ITestParametersModel[]> => {
  console.log('Getting test parameters by classIDs', classIDs)
  
  return await TestParameters.find({ objectID: { $in: classIDs } })
}

export const getTestParametersByClassID = async (classID: string): Promise<ITestParameters> => {
  console.log('Getting test parameters class', classID)

  return await TestParameters.findOne({ objectID: classID }).exec()
}

export const createTestParameters = async (params: ITestParameters): Promise<ITestParametersModel> => {
  console.log('Creating new test parameters', params)
  
  return await new TestParameters({...params}).save()
}


export const updateTestParameters = async (testParametersID: string, updates: ITestParameters, userID: string): Promise<ITestParametersModel> => {
  console.log('Updating test parameters', updates, userID)
  
  const { operators, numbers, questions, randomQuestions, duration } = updates
  
  const testParameters = await getTestParametersByID(testParametersID)
  
  if (duration !== undefined && duration !== null) {
    testParameters.duration = duration
  }
  
  if (operators !== undefined && operators !== null) {
    testParameters.operators = operators
  }
  
  if (numbers !== undefined && numbers !== null) {
    testParameters.numbers = numbers
  }
  
  if (questions !== undefined && questions !== null) {
    testParameters.questions = questions
  }
  
  if (randomQuestions !== undefined && randomQuestions !== null) {
    testParameters.randomQuestions = randomQuestions
  }
  
  return await testParameters.save()
}

export const removeTestParametersByUserID = (userID: Types.ObjectId): Promise<ITestParametersModel> => {
  return new Promise((resolve, reject) => {
    // TODO
  })
}

export const assertUserIsAuthorizedForGetTestParameters = async (user: IUserModel, classID: string) => {
  const teacher = await getTeacherByID(user._id)
  
  await assertTeacherOwnsClass(teacher, classID)
}

export const assertUserIsAuthorizedForNewTestParameters = async (user: IUserModel, classID: string) => {
  const teacher = await getTeacherByUserID(user._id)
  
  await assertTeacherOwnsClass(teacher, classID)
  
  await assertClassDoesNotHaveTestParameters(classID)
}

export const assertUserIsAuthorizedForUpdateTestParameters = async (user: IUserModel, testParametersID: string) => {
  const teacher = await getTeacherByUserID(user._id)
  
  await assertTeacherOwnsTestParameters(teacher, testParametersID)
}

export const assertTeacherOwnsClass = async (teacher: ITeacherModel, classID: string) => {
  if (!teacher.classIDs.some((id) => id.toString() === classID)) {
    throw new Error(`The user does not own a class with an ID of ${classID} and is not authorized to create test parameters for it`)
  }
}

export const assertTeacherOwnsTestParameters = async (teacher: ITeacherModel, testParametersID: string) => {
  const classTestParameters = await getTestParametersByClassIDs(teacher.classIDs)
  
  if (classTestParameters.some((p) => p._id.toString() === testParametersID) === false) {
    console.log('Teacher does not contain a class with the given testParametersID', teacher, testParametersID)
    throw new Error('Teacher does not contain a class with the given testParametersID')
  }
}

export const assertClassDoesNotHaveTestParameters = async (classID: string) => {
  const existingParameters = await TestParameters.findOne({ objectID: classID }).exec()
  
  if (existingParameters !== null) {
    throw new Error(`Test parameters already exist for the class with an ID of ${classID}`)
  }
}
