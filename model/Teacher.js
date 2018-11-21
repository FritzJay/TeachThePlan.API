import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';
import { ObjectId } from 'mongodb';

export default class Teacher {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('teacher');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  findOneByUserId(userId) {
    return this.collection.findOne({ userId: ObjectId(userId) });
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  courses(teacher, { lastCreatedAt = 0, limit = 10 }) {
    return this.context.Course.collection.find({
      teacherId: teacher._id,
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  user(teacher) {
    return this.context.User.findOneById(teacher.userId);
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
