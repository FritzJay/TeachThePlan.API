import { Document, Schema, Model, Types, model } from 'mongoose';
import { ISchool } from '../library/schools/schools';
import { TeacherSchema } from './teacher.model';
import { TestParametersSchema } from './testParameters.model';

export interface ISchoolModel extends ISchool, Document { }
const SchoolSchema: Schema = new Schema({
  name: String,
  testParameters: TestParametersSchema,
  teachers: [TeacherSchema]
});

export const School: Model<ISchoolModel> = model<ISchoolModel>("School", SchoolSchema);