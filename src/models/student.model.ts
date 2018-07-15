import { Document, Schema, Model, model, SchemaTypes } from 'mongoose';
import { IStudent } from '../library/students/students';

export interface IStudentModel extends IStudent, Document { }
export const StudentSchema: Schema = new Schema({
  userID: SchemaTypes.ObjectId,
  displayName: String,
}); 

export const Student: Model<IStudentModel> = model<IStudentModel>("Student", StudentSchema);