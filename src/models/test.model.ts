import { Document, Schema, SchemaTypes, Model, model, Types } from 'mongoose'
import { IQuestion } from '../library/tests/tests'

export interface ITest {
  userID?: Types.ObjectId
  duration?: number
  start?: Date
  end?: Date
  questions: IQuestion[]
}

export interface IQuestionModel extends IQuestion, Document { }
const QuestionSchema: Schema = new Schema({
  question: String,
  studentAnswer: String,
  correctAnswer: String,
  start: Date,
  end: Date,
}, { _id: false })

export interface ITestModel extends ITest, Document { }
export const TestSchema: Schema = new Schema({
  userID: SchemaTypes.ObjectId,
  duration: Number,
  start: Date,
  end: Date,
  questions: [QuestionSchema],
})

export const Question: Model<IQuestionModel> = model<IQuestionModel>("Question", QuestionSchema)
export const Test: Model<ITestModel> = model<ITestModel>("Test", TestSchema)