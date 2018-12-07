import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';

import {
  createQuestions,
  gradeQuestion,
  createTestResults,
} from '../src/library/testing';

export default class Test {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('test');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }
  
  findManyByCourseId(id) {
    return this.collection.find({ courseId: id }).toArray();
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
    if (test.courseId) {
      return this.context.Course.findOneById(test.courseId);
    }
    return null
  }

  testResults(test) {
    return this.context.TestResults.findOneByTestId(test._id);
  }

  async insert(test) {
    const docToInsert = Object.assign({}, {
      ...test,
      start: null,
      end: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const testId = (await this.collection.insertOne(docToInsert)).insertedId;
    const newQuestions = await createQuestions(test.operator, test.number, test.questions, test.randomQuestions);
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

  async grade(testId, test, passing) {
    const questions = await Promise.all(
      test.questions.map(async (q) => {
        const question = await this.context.Question.collection.findOne({ _id: q.id });
        const gradedQuestion = await gradeQuestion({ ...q, question: question.question });
        await this.context.Question.updateById(q.id, gradedQuestion);
        return { id: q.id, ...gradedQuestion };
      })
    );
    const testResults = await createTestResults(questions, passing);
    await this.updateById(testId, {
      start: test.start,
      end: test.end,
    });
    await this.context.TestResults.insert({ testId, ...testResults });
    return await this.findOneById(testId);
  }

  async updateById(id, doc) {
    const ret = await this.collection.updateOne({ _id: id }, {
      $set: Object.assign({}, doc, {
        updatedAt: Date.now(),
      }),
    });
    this.loader.clear(id);
    return ret;
  }

  async removeById(id) {
    const { deletedCount } = await this.collection.deleteOne({ _id: id });
    this.loader.clear(id);
    return deletedCount === 1;
  }

  async removeByStudentId(studentId) {
    const { result } = await this.collection.deleteMany({ studentId });
    return result.ok === 1;
  }

  async removeByCourseId(id) {
    const { result } = await this.collection.deleteMany({ courseId: id });
    return result.ok === 1;
  }
}
