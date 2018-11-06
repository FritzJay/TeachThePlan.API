import { Document, Schema, Model, model, SchemaTypes } from 'mongoose'
import { ITestParameters } from '../library/testParameters/testParameters'

export interface ITestParametersModel extends ITestParameters, Document { }
export const TestParametersSchema: Schema = new Schema({
  objectID: SchemaTypes.ObjectId,
  duration: Number,
  numbers: [Number],
  operators: [String],
  questions: Number,
  randomQuestions: Number,
})

export const TestParameters: Model<ITestParametersModel> = model<ITestParametersModel>("TestParameters", TestParametersSchema)