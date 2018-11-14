import { getTeacherFromToken } from "../library/teachers/teachers";
import { IFormattedTestParameters, updateTestParameters, getTestParametersFromID } from "../library/testParameters/testParameters";

/* GET TEST PARAMETERS */
export const getTestParameters = async (rootValue, {token, id}: { token: string, id: string}): Promise<IFormattedTestParameters> => {
  const teacher = await getTeacherFromToken(token)
  const testParameters = await getTestParametersFromID(id)
  if (testParameters === null) {
    throw new Error('Unable to find test parameters')
  }
  if (!teacher.model.classIDs.some((_id) => _id.equals(testParameters.model.objectID))) {
    throw new Error('You are not authorized to view these test parameters')
  }
  return testParameters.formatted
}

/* UPDATE TEST PARAMETERS */
export const changeTestParameters = async (rootValue, { token, updates }: { token: string, updates: IFormattedTestParameters }): Promise<IFormattedTestParameters> => {
  const teacher = await getTeacherFromToken(token)
  const testParameters = await getTestParametersFromID(updates.id)
  if (!teacher.model.classIDs.some((_id) => _id.equals(testParameters.model.objectID))) {
    throw new Error('You are not authorized to update these test parameters')
  }
  const updatedTestParameters = await updateTestParameters(testParameters, updates)
  return updatedTestParameters.formatted
}