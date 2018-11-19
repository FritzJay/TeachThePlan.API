import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';
import { ObjectId } from 'mongodb';

export default class CourseInvitation {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('courseInvitation');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }
  
  findOneByCourseIdAndStudentId(courseId, studentId) {
    return this.collection.findOne({ courseId, studentId });
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  student(courseInvitation) {
    return this.context.Student.findOneById(courseInvitation.studentId);
  }

  course(courseInvitation) {
    return this.context.Course.findOneById(courseInvitation.courseId);
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
    const ret = await this.collection.update({ _id: id }, {
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

  async removeByCourseId(id) {
    const { result } = await this.collection.deleteMany({ courseId: ObjectId(id) })
    return result.ok === 1
  }
}
