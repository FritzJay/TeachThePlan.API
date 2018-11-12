import { Document, Schema, Model, SchemaTypes, model, Types } from 'mongoose'

export interface IClass {
  classCode?: string,
  grade: string,
  name: string,
  studentIDs?: Types.ObjectId[],
}

export interface IClassModel extends IClass, Document { }
export const ClassSchema: Schema = new Schema({
  classCode: String,
  grade: String,
  name: String,
  studentIDs: [SchemaTypes.ObjectId]
}) 

export const Class: Model<IClassModel> = model<IClassModel>("Class", ClassSchema)