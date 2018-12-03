import DataLoader from 'dataloader';
import findByIds from 'mongo-find-by-ids';
import bcrypt from 'bcrypt';

const ROUNDS = 10;

export default class User {
  constructor(context) {
    this.context = context;
    this.collection = context.db.collection('user');
    this.loader = new DataLoader(ids => findByIds(this.collection, ids));
  }

  findOneById(id) {
    return this.loader.load(id);
  }

  async findOneByEmail(email) {
    const user = await this.collection.find({ email })
      .collation({ locale: "en_US", strength: 1 })
      .limit(1)
      .toArray();
    return user && user.length > 0
      ? user[0]
      : null
  }

  async findOneByUsername(username) {
    const user = await this.collection.find({ username })
    .collation({ locale: "en_US", strength: 1 })
    .limit(1)
    .toArray();
  return user && user.length > 0
    ? user[0]
    : null
  }

  async findOneByEmailOrUsername(email, username) {
    const user = await this.findOneByUsername(username);
    if (user && username) {
      return user;
    }
    return this.findOneByEmail(email);
  }

  all({ lastCreatedAt = 0, limit = 10 }) {
    return this.collection.find({
      createdAt: { $gt: lastCreatedAt },
    }).sort({ createdAt: 1 }).limit(limit).toArray();
  }

  async insert(doc) {
    const { password, ...remaining} = doc;
    const docToInsert = Object.assign({}, remaining, {
      hash: await bcrypt.hash(password, ROUNDS),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    const id = (await this.collection.insertOne(docToInsert)).insertedId;
    return id;
  }

  async updateById(id, doc) {
    const { password, ...rest } = doc
    const ret = await this.collection.updateOne({ _id: id }, {
      $set: Object.assign({}, rest, {
        updatedAt: Date.now(),
      },
        password !== undefined
          ? { hash: await bcrypt.hash(password, ROUNDS) }
          : {}
      ),
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
