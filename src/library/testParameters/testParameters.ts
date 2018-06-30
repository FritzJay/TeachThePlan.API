import { ITestParameters } from "../../interfaces/testParameters";
import { TestParameters, ITestParametersModel } from "../../models/testParameters.model";
import { IUser } from "../../interfaces/user";

interface ITestParametersCallback {
  (error?: Error, user?: ITestParametersModel): any;
}

export const createTestParameters = (params: ITestParameters, callback: ITestParametersCallback): void => {
  new TestParameters({
    ...params
  })
  .save()
  .then((newTestParams: ITestParametersModel) => {
    callback(null, newTestParams);
  })
  .catch((saveError: Error) => {
    callback(saveError, null);
  });
}

export const getTestParameters = (user: IUser): ITestParameters => {
  return {
    operator: "sample operator",
    number: 5,
    questions: 20,
    randomQuestions: 0,
    duration: 75,
  }
}