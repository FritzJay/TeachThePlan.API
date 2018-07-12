import { Document, Schema, Model, SchemaTypes, model } from 'mongoose';
import { IClass } from '../library/classes/classes';
import { TestParametersSchema } from './testParameters.model';

export interface IClassModel extends IClass, Document { }
export const ClassSchema: Schema = new Schema({
  classCode: String,
  testParameters: [TestParametersSchema],
  students: [SchemaTypes.ObjectId]
}); 

export const Class: Model<IClassModel> = model<IClassModel>("Class", ClassSchema);