import { IUser } from '../../interfaces/user';
import { IAvailableTests, getAvailableTests, newTest, gradeTest } from "./tests";

describe('getAvailableTests', () => {
  it('returns available tests', () => {
    const user: IUser = {
      firstName: "test",
      lastName: "user"
    }
    const availableTests = getAvailableTests(user);
    expect(availableTests).not.toBeNull;
  });
});