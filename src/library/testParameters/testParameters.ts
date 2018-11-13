import { TestParameters, ITestParametersModel } from "../../models/testParameters.model"
import { IClassModel } from "../../models/class.model"
import { Types } from "mongoose";

export interface IFormattedTestParameters {
  id: string
  duration: number
  numbers: number[]
  operators: string[]
  questions: number
  randomQuestions: number
}

export class FormattedTestParameters {
  public model: ITestParametersModel
  public formatted: IFormattedTestParameters

  constructor(testParameters: ITestParametersModel) {
    this.model = testParameters
    this.formatted = this.formatTestParameters(testParameters)
  }

  private formatTestParameters = ({ _id, duration, numbers, operators, questions, randomQuestions }) => ({
    id: _id.toString(),
    duration,
    numbers,
    operators,
    questions,
    randomQuestions,
  })
}

export const getTestParametersFromID = async (testParametersID: string): Promise<FormattedTestParameters> => {
  const testParameters = await TestParameters.findById(testParametersID).exec()
  return new FormattedTestParameters(testParameters)
}

export const getTestParametersForClass = async (cls: IClassModel): Promise<FormattedTestParameters> => {
  const testParameters = await TestParameters.findOne({ objectID: cls._id }).exec()
  if (testParameters === null) {
    throw new Error(`Could not find test parameters for the class: ${cls._id}`)
  }
  return new FormattedTestParameters(testParameters)
}

export const createTestParametersForNewClass = async (classID: string): Promise<FormattedTestParameters> => {
  const testParameters = await TestParameters.create({
    objectID: classID,
    duration: 75,
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    operators: ['+', '-', '*', '/'],
    questions: 20,
    randomQuestions: 5,
  })
  return new FormattedTestParameters(testParameters)
}

export const removeTestParametersFromClass = (classID: string): Promise<ITestParametersModel> => {
  return TestParameters.findOneAndDelete({ objectID: classID }).exec()
}

export const updateTestParameters = (testParameters: FormattedTestParameters, updates: IFormattedTestParameters) => {
  const { id, ...remainingUpdates } = updates
  testParameters.formatted = {
    ...testParameters.formatted,
    ...remainingUpdates,
  }
  testParameters.model.update({
    ...remainingUpdates
  }).exec()
  return testParameters
}

/*
export const addTestParametersToClass = async (classID: string) => {
  console.log('Adding test parameters to class', classID)

  createTestParameters({
    objectID: classID,
    duration: 75,
    operators: ['+', '-', '*', '/'],
    numbers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    questions: 20,
    randomQuestions: 5,
  })
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
  const teacher = await getTeacherFromUserID(user._id)
  
  await assertTeacherOwnsClass(teacher, classID)
}

export const assertUserIsAuthorizedForNewTestParameters = async (user: IUserModel, classID: string) => {
  const teacher = await getTeacherFromUserID(user._id)
  
  await assertTeacherOwnsClass(teacher, classID)
  
  await assertClassDoesNotHaveTestParameters(classID)
}

export const assertUserIsAuthorizedForUpdateTestParameters = async (user: IUserModel, testParametersID: string) => {
  const teacher = await getTeacherFromUserID(user._id)
  
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
*/