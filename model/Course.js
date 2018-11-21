import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';

export default class Course {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('course');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  findManyByNameAndTeacherId(name, id) {
    return this.collection.find({ name, teacherId: id })
      .collation({ locale: "en_US", strength: 1 })
      .toArray();
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  students(course, { lastCreatedAt = 0, limit = 10 }) {
    return this.context.Student.collection.find({
      coursesIds: course._id,
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  teacher(course) {
    return this.context.Teacher.findOneById(course.teacherId);
  }

  testParameters(course) {
    return this.context.TestParameters.findOneById(course.testParametersId);
  }

  courseInvitations(course, { lastCreatedAt = 0, limit = 10 }) {
    return this.context.CourseInvitation.collection.find({
      courseId: course._id,
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
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
