import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { ITeacher } from '../library/teachers/teachers';
import { TestParametersSchema } from './testParameters.model';

export interface ITeacherModel extends ITeacher, Document { }
export const TeacherSchema: Schema = new Schema({
  user: SchemaTypes.ObjectId,
  displayName: String,
  testParameters: TestParametersSchema,
  classes: [SchemaTypes.ObjectId],
});

export const Teacher: Model<ITeacherModel> = model<ITeacherModel>("Teacher", TeacherSchema);