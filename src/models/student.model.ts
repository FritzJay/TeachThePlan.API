import { Document, Schema, Model, model, SchemaTypes, Types } from 'mongoose'
import { ITest } from '../library/tests/tests'

export interface IStudent {
  userID: Types.ObjectId,
  displayName: string,
  tests?: ITest[],
}

export interface IStudentModel extends IStudent, Document { }
export const StudentSchema: Schema = new Schema({
  userID: SchemaTypes.ObjectId,
  displayName: String,
}) 

export const Student: Model<IStudentModel> = model<IStudentModel>("Student", StudentSchema)