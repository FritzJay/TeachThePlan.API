import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { IStudent } from '../library/students/students';
import { TestSchema } from './test.model';
import { TestParametersSchema } from './testParameters.model';

export interface IStudentModel extends IStudent, Document { }
export const StudentSchema: Schema = new Schema({
  user: SchemaTypes.ObjectId,
  displayName: String,
  testParameters: TestParametersSchema,
  tests: [TestSchema]
}); 

export const Student: Model<IStudentModel> = model<IStudentModel>("Student", StudentSchema);