import { Document, Schema, Model, model } from "mongoose";
import { IUser } from "../interfaces/user";

export interface IUserModel extends IUser, Document {
  displayName: string;
}

export var UserSchema: Schema = new Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String
});
UserSchema.methods.displayName = function(): string {
  return (this.firstName.trim() + " " + this.lastName.trim());
}

export const User: Model<IUserModel> = model<IUserModel>("User", UserSchema);