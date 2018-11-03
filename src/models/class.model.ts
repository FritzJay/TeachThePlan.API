import { Document, Schema, Model, SchemaTypes, model } from 'mongoose'
import { IClass } from '../library/classes/classes'

export interface IClassModel extends IClass, Document { }
export const ClassSchema: Schema = new Schema({
  classCode: String,
  grade: String,
  name: String,
  studentIDs: [SchemaTypes.ObjectId]
}) 

export const Class: Model<IClassModel> = model<IClassModel>("Class", ClassSchema)