import { UserInputError } from "apollo-server-express";

export * from './Course';
export * from './CourseInvitation';
export * from './Student';
export * from './Teacher';
export * from './Test';
export * from './TestParameters';

export const assertDocumentExists = (doc, name) => {
  if (doc === null || doc === undefined) {
    throw new UserInputError(`The document "${name}" does not exist`)
  }
}