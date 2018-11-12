import { Document, Schema, Model, model, SchemaTypes, Types } from 'mongoose'

export interface ITeacher {
  userID: Types.ObjectId
  displayName: string
  classIDs: Types.ObjectId[]
}

export interface ITeacherModel extends ITeacher, Document { }
export const TeacherSchema: Schema = new Schema({
  userID: SchemaTypes.ObjectId,
  displayName: String,
  classIDs: [SchemaTypes.ObjectId],
})

export const Teacher: Model<ITeacherModel> = model<ITeacherModel>("Teacher", TeacherSchema)