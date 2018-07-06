import { Document, Schema, Model, Types, model } from 'mongoose';
import { IClass } from '../library/classes/classes';
import { TestParametersSchema } from './testParameters.model';
import { StudentSchema } from './student.model';

export interface IClassModel extends IClass, Document { }
export const ClassSchema: Schema = new Schema({
  classCode: String,
  testParameters: [TestParametersSchema],
  students: [StudentSchema]
}); 

export const Class: Model<IClassModel> = model<IClassModel>("Class", ClassSchema);