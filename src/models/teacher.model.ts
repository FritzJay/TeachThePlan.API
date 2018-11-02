import { Document, Schema, Model, model, SchemaTypes } from 'mongoose'
import { ITeacher } from '../library/teachers/teachers'

export interface ITeacherModel extends ITeacher, Document { }
export const TeacherSchema: Schema = new Schema({
  userID: SchemaTypes.ObjectId,
  displayName: String,
  classIDs: [SchemaTypes.ObjectId],
})

export const Teacher: Model<ITeacherModel> = model<ITeacherModel>("Teacher", TeacherSchema)