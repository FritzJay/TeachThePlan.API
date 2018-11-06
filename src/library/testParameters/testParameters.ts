import { ITestParameters } from '../testParameters/testParameters'
import { TestParameters, ITestParametersModel } from '../../models/testParameters.model'
import { Types } from 'mongoose'
import { getTeacherByUserID } from '../teachers/teachers';

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

export const createTestParameters = async (params: ITestParameters): Promise<ITestParametersModel> => {
  console.log('Creating new test parameters', params)

  return await new TestParameters({...params}).save()
}

export const updateTestParameters = async (testParametersID: string, updates: ITestParameters, userID: string): Promise<ITestParametersModel> => {
  console.log('Updating test parameters', updates, userID)

  const { operators, numbers, questions, randomQuestions, duration } = updates

  const teacher = await getTeacherByUserID(userID)

  const testParameters = await getTestParametersByID(testParametersID)

  const classTestParameters = await getTestParametersByClassIDs(teacher.classIDs)

  console.log(classTestParameters)

  if (classTestParameters.some((p) => p._id.toString() === testParametersID) === false) {
    console.log('Teacher does not contain a class with the given testParametersID', teacher, testParametersID)
    throw new Error('Teacher does not contain a class with the given testParametersID')
  }

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

const getTestParametersByClassIDs = async (classIDs: string[]): Promise<ITestParametersModel[]> => {
  console.log('Getting test parameters by classIDs', classIDs)

  return await TestParameters.find({ objectID: { $in: classIDs } })
}
export const getTestParametersByClassID = async (classID: string): Promise<ITestParameters> => {
  console.log('Getting test parameters class', classID)

  return await TestParameters.findOne({ objectID: classID }).exec()
}

export const removeTestParametersByUserID = (userID: Types.ObjectId): Promise<ITestParametersModel> => {
  return new Promise((resolve, reject) => {
    // TODO
  })
}