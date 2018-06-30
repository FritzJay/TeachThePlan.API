import { Document, Schema, Model, model } from "mongoose";
import { ITest, ITestResults, IQuestion } from "../interfaces/test";
import { gradeTest } from "../library/tests";

export interface IQuestionModel extends IQuestion, Document { }
const QuestionSchema: Schema = new Schema({
  question: String,
  studentAnswer: String,
  correctAnswer: String,
  start: Date,
  end: Date,
}, { _id: false });

export interface ITestModel extends ITest, Document { }
const TestSchema: Schema = new Schema({
  duration: Number,
  start: Date,
  end: Date,
  questions: [QuestionSchema],
});
TestSchema.methods.results = function(): ITestResults {
  return gradeTest(this);
}

export const Question: Model<IQuestionModel> = model<IQuestionModel>("Question", QuestionSchema);
export const Test: Model<ITestModel> = model<ITestModel>("Test", TestSchema);