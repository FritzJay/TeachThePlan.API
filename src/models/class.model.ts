import { Document, Schema, Model, Types, model } from 'mongoose';

export interface IClass {
  classCode: string,
  students: Types.ObjectId[]
}

export interface IClassModel extends IClass, Document { }
const ClassSchema: Schema = new Schema({
  classCode: String,
  students: [Types.ObjectId]
}); 

export const Class: Model<IClassModel> = model<IClassModel>("Class", ClassSchema);