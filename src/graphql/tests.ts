import { getClassFromID } from '../library/classes/classes'
import { createTest } from '../library/tests/tests'
import { getStudentFromToken } from '../library/students/students'

/* NEW TEST */
export const newTest = async (rootValue, { token, classID, operator, number }: { token: string, classID: string, number: number, operator: string }) => {
  const student = await getStudentFromToken(token)
  const cls = await getClassFromID(classID)
  await cls.formatClass()
  if (!cls.model.studentIDs.some((id) => id.equals(student.formatted.id))) {
    throw new Error('You are not authorized to create a new test in this class')
  }
  const test = await createTest(cls.formatted.testParameters, number, operator)
  return test.formatted
}