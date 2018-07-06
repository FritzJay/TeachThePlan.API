import { Document, Schema, Model, Types, model } from 'mongoose';
import { ITeacher } from '../library/teachers/teachers';
import { ClassSchema } from './class.model';
import { TestParametersSchema } from './testParameters.model';

export interface ITeacherModel extends ITeacher, Document { }
export const TeacherSchema: Schema = new Schema({
  user: Types.ObjectId,
  displayName: String,
  testParameters: TestParametersSchema,
  classes: [ClassSchema],
});

export const Teacher: Model<ITeacherModel> = model<ITeacherModel>("Teacher", TeacherSchema);