import { Model, ModelOptions, QueryContext } from 'objection';

export class BaseModel extends Model {
  // Created at / updated at timestamps (if columns exist)
  created_at?: string;
  updated_at?: string;

  static get modelPaths(): string[] {
    return [__dirname];
  }

  async $beforeInsert(queryContext: QueryContext) {
    await super.$beforeInsert(queryContext);
  }

  async $beforeUpdate(opt: ModelOptions, queryContext: QueryContext) {
    await super.$beforeUpdate(opt, queryContext);
  }

  static async pullById(id: number | string) {
    return this.query().findById(id);
  }
}
