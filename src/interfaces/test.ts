export interface ITest {
  duration?: number;
  start?: Date;
  end?: Date;
  questions: IQuestion[];
}

export interface IQuestion {
  question: string;
  studentAnswer?: string;
  correctAnswer?: string;
  start?: Date;
  end?: Date;
}

export interface ITestResults {
  total: number;
  needed: number;
  correct: string[];
  incorrect: string;
  quickest: string;
}