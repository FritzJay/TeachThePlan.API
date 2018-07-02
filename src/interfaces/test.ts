export interface ITest {
  duration?: number;
  start?: Date;
  end?: Date;
  questions: IQuestion[];
}

export interface IQuestion {
  question: string;
  studentAnswer?: number;
  correctAnswer?: number;
  start?: Date;
  end?: Date;
}

export interface ITestResults {
  total: number;
  needed: number;
  correct: number;
  incorrect: IQuestion;
  quickest: IQuestion;
}