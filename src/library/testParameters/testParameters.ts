import { ITestParameters } from "../../interfaces/testParameters";
import { Callback } from "../../interfaces/callback";
import { TestParameters, ITestParametersModel } from "../../models/testParameters.model";
import { IUser } from "../../interfaces/user";

export const createTestParameters = (params: ITestParameters, callback: Callback): void => {
  new TestParameters({
    ...params
  })
  .save()
  .then((newTestParams: ITestParametersModel) => {
    callback(null, newTestParams);
  })
  .catch((saveError: Error) => {
    callback([saveError], null);
  });
}

export const getTestParameters = (user: IUser, callback): void => {
  const testParameters = {
    operator: "sample operator",
    number: 5,
    questions: 20,
    randomQuestions: 0,
    duration: 75,
  }
  callback(null, testParameters);
}