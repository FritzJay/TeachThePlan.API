import { ITestParameters } from '../testParameters/testParameters'
import { TestParameters, ITestParametersModel } from '../../models/testParameters.model'
import { Types } from 'mongoose'
import { getTeacherByUserID } from '../teachers/teachers';

export interface ITestParameters {
  objectID: Types.ObjectId
  duration: number
  operators: string[]
  numbers: number[]
  questions: number
  randomQuestions: number
}

export const updateTestParameters = async (testParametersID: string, updates: ITestParameters, userID: string): Promise<ITestParametersModel> => {
  console.log('Updating test parameters', updates, userID)

  const { operators, numbers, questions, randomQuestions, duration } = updates

  const teacher = await getTeacherByUserID(userID)

  const testParameters = await getTestParametersByID(testParametersID)

  const classTestParameters = await getTestParametersByClassIDs(teacher.classIDs)

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

const getTestParametersByID = async (testParametersID: string): Promise<ITestParametersModel> => {
  console.log('Getting test parameters by id', testParametersID)

  return await TestParameters.findById(testParametersID).exec()
}

const getTestParametersByClassIDs = async (classIDs: string[]): Promise<ITestParametersModel[]> => {
  console.log('Getting test parameters by classIDs', classIDs)

  return await TestParameters.find({ _id: { $in: classIDs } })
}