import { Document, Schema, Model, model, SchemaTypes } from 'mongoose'
import { IParent } from '../library/parents/parents'

export interface IParentModel extends IParent, Document { }
export const ParentSchema: Schema = new Schema({
  userID: SchemaTypes.ObjectId,
  displayName: String,
}) 

export const Parent: Model<IParentModel> = model<IParentModel>("Parent", ParentSchema)