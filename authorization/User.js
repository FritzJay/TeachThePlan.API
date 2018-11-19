import { UserInputError } from "apollo-server-express";

export const assertUserWithEmailDoesNotExist = async (email, User) => {
  const user = await User.findOneByEmail(email);
  if (user !== null) {
    throw new UserInputError(`A user with the email "${email}" already exists`)
  }
}