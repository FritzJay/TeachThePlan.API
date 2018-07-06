import { Document, Schema, Model, model } from "mongoose";
import { IUser } from "../library/users/users";

export interface IUserModel extends IUser, Document {
  displayName: string;
}

export var UserSchema: Schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String
});

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);