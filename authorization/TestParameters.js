import { AuthenticationError } from "apollo-server-express";

export const assertAuthenticatedUserIsAuthorizedToUpdateTestParameters = async (authedUser, testParametersId, Teacher) => {
  const teacher = await Teacher.findOneByUserId(authedUser.userId);
  const courses = await Teacher.courses(teacher, {limit: 0 });
  const testParametersIds = courses.map((course) => course.testParametersId)
  if (!testParametersIds.some((id) => id.equals(testParametersId))) {
    throw new AuthenticationError('You are not authorized to update these test parameters');
  }
}