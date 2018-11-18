import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';
import * as math from 'mathjs';

export default class Test {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('test');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  questions(test) {
    return this.context.Question.collection.find({
      _id: { $in: test.questionIds },
    }).sort({ createdAt: 1 }).toArray();
  }

  student(test) {
    return this.context.Student.findOneById(test.studentId);
  }

  course(test) {
    return this.context.Course.findOneById(test.courseId);
  }

  testResults(test) {
    return this.context.TestResults.findOneByTestId(test._id);
  }

  async insert({ studentId, courseId, duration, questions, randomQuestions, operator, number }) {
    const docToInsert = Object.assign({}, {
      studentId,
      courseId,
      duration,
      operator,
      number,
      randomQuestions,
      start: null,
      end: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const testId = (await this.collection.insertOne(docToInsert)).insertedId;
    const newQuestions = await createQuestions(operator, number, questions, randomQuestions);
    const questionIds = await Promise.all(
      newQuestions.map(async ({ question }) => await this.context.Question.insert({
        question,
        studentAnswer: null,
        correctAnswer: null,
        start: null,
        end: null,
        testId,
      }))
    );
    await this.updateById(testId, { questionIds });
    return testId;
  }

  async grade(testId, test) {
    const total = test.questions.length
    const needed = Math.round(test.questions.length * PASSING_PERCENTAGE)
    const questions = await Promise.all(
      test.questions.map(async ({ id, start, end, studentAnswer }) => {
        const question = await this.context.Question.findOneById(id);
        const correctAnswer = math.eval(question.question)
        await this.context.Question.updateById(id, {
          start,
          end,
          studentAnswer,
          correctAnswer: isNaN(correctAnswer) || correctAnswer === Infinity
            ? 0
            : correctAnswer
        });
        return this.context.Question.findOneById(id);
      })
    );
    const correct = questions.filter((q) => q.studentAnswer === q.correctAnswer).length;
    const incorrectId = getRandomIncorrectlyAnsweredQuestion(questions);
    const quickestId = getQuickestAnsweredQuestion(questions);
    await this.updateById(testId, {
      start: test.start,
      end: test.end,
    });
    await this.context.TestResults.insert({
      total,
      needed,
      correct,
      incorrectId,
      quickestId,
      testId,
    });
    return await this.findOneById(testId);
  }

  async updateById(id, doc) {
    const ret = await this.collection.update({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now(),
      }),
    });
    this.loader.clear(id);
    return ret;
  }

  async removeById(id) {
    const ret = this.collection.remove({ _id: id });
    this.loader.clear(id);
    return ret;
  }
}

export const OPERATORS = ['+', '-', '*', '/'];
export const NUMBERS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
export const MAX_NUMBER = 12;
export const PASSING_PERCENTAGE = 0.9;

export const createQuestions = async (operator, number, questions, randomQuestions) => {
  let formattedQuestions = [];

  while (formattedQuestions.length < questions) {
    const secondNumber = formattedQuestions.length % MAX_NUMBER;
    const formattedQuestion = createFormattedQuestion(operator, number, secondNumber);
    formattedQuestions.push(formattedQuestion);
  }

  while (formattedQuestions.length < questions + randomQuestions) {
    const randomNumberBetweenZeroAndNumber = (Math.random() * (number + 1) | 0);
    const randomNumberBetweenZeroAndMax = (Math.random() * (MAX_NUMBER + 1) | 0);
    formattedQuestions.push(createFormattedQuestion(operator, randomNumberBetweenZeroAndNumber, randomNumberBetweenZeroAndMax));
  }

  return formattedQuestions;
}

export const createFormattedQuestion = (operator, firstNumber, secondNumber) => {
  const numbers = [firstNumber, secondNumber];

  if (operator === '/' && !numbers.includes(0)) {
    numbers[1] = secondNumber * firstNumber;
  }

  const shufflingWontResultInFractionsOrNegatives = !['-', '/'].includes(operator);
  if (shufflingWontResultInFractionsOrNegatives) {
    numbers.sort(() => Math.random() - 0.5);
  } else {
    numbers.sort((a, b) => b - a);
  }
  
  return {
    question: `${numbers[0]} ${operator} ${numbers[1]}`,
  }
}

export const getRandomIncorrectlyAnsweredQuestion = (questions) => {
  const incorrectlyAnsweredQuestions = questions.filter((q) => !isCorrect(q));

  if (incorrectlyAnsweredQuestions.length > 0) {
    const answeredQuestions = incorrectlyAnsweredQuestions.filter((q) => !isSkipped(q));

    if (answeredQuestions.length > 0) {
      return answeredQuestions[Math.floor(Math.random() * answeredQuestions.length)]._id;
    } else {
      return incorrectlyAnsweredQuestions[Math.floor(Math.random() * incorrectlyAnsweredQuestions.length)]._id;
    }
  } else {
    return undefined;
  }
}

export const getQuickestAnsweredQuestion = (questions) => {
  const correctlyAnsweredQuestions = questions.filter((q) => isCorrect(q))

  if (correctlyAnsweredQuestions.length !== 0) {
    return correctlyAnsweredQuestions.reduce((a, b) => {
      const aDuration = new Date(a.end).getTime() - new Date(a.start).getTime()
      const bDuration = new Date(b.end).getTime() - new Date(b.start).getTime()

      return aDuration < bDuration ? a : b
    })._id;
  }
}

const isCorrect = (question) => {
  if (isSkipped(question)) {
    return false
  }

  return question.correctAnswer.toString() === question.studentAnswer.toString()
}

const isSkipped = (question) => {
  return question.studentAnswer === undefined || question.studentAnswer === null
}

export const incrementOrResetAt = (number, max) => {
  if (number < max) {
    return number + 1
  } else {
    return 0
  }
}