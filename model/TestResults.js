import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';

export default class TestResults {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('testResults');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  findOneByTestId(id) {
    return this.collection.findOne({ testId: id });
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  incorrect(testResults) {
    return testResults.incorrectId
      ? this.context.Question.findOneById(testResults.incorrectId)
      : null;
  }

  quickest(testResults) {
    return testResults.quickestId
      ? this.context.Question.findOneById(testResults.quickestId)
      : null;
  }

  test(testResults) {
    return this.context.Test.findOneById(testResults.testId);
  }

  async insert(doc) {
    const docToInsert = Object.assign({}, doc, {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
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
}
