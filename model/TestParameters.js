import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';

export default class TestParameters {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('testParameters');
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

  course(testParameters) {
    return this.context.Course.collection.find({ _id: testParameters.courseId });
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
