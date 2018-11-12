import { Document, Schema, Model, model } from "mongoose"

export interface IUser {
  email: string
  password?: string
  firstName?: string
  lastName?: string
  userType?: string[]
}

export interface IUserModel extends IUser, Document {
  email: string
  displayName: string
  userType: string[]
}

export var UserSchema: Schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  userType: [String],
})

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema)