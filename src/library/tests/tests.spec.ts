import { IUser } from '../../interfaces/user';
import { 
  OPERATORS,
  NUMBERS,
  IAvailableTests,
  getAvailableTests,
  newTest,
  gradeTest
} from "./tests";

describe('getAvailableTests', () => {
  it('returns all available tests', (done) => {
    const user: IUser = {
      firstName: "test",
      lastName: "user"
    }
    const callback = (error: Error, availableTests: IAvailableTests) => {
      expect(availableTests).toEqual({
        operators: OPERATORS,
        numbers: NUMBERS,
      });
      done();
    }
    getAvailableTests(user, callback);
  });
});