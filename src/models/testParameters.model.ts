import { Document, Schema, Model, model } from 'mongoose';
import { ITestParameters } from '../library/testParameters/testParameters';

export interface ITestParametersModel extends ITestParameters, Document { }
export const TestParametersSchema: Schema = new Schema({
  operator: String,
  number: String,
  questions: Number,
  randomQuestions: Number,
  duration: Number,
});

export const TestParameters: Model<ITestParametersModel> = model<ITestParametersModel>("TestParameters", TestParametersSchema);