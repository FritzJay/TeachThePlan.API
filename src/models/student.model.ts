import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { IStudent } from '../library/students/students';
import { TestSchema } from './test.model';

export interface IStudentModel extends IStudent, Document { }
export const StudentSchema: Schema = new Schema({
  user: SchemaTypes.ObjectId,
  displayName: String,
  tests: [TestSchema]
}); 

export const Student: Model<IStudentModel> = model<IStudentModel>("Student", StudentSchema);