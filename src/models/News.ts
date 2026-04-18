import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class News extends BaseModel {
  static tableName = 'tblnews';
  static idColumn = 'id';

  id!: number;
  content_id!: number;
  description!: string | null;
  userid!: number;
  status!: number;
  create_date!: string | null;
  priority!: number;
  publish_date!: string | null;

  static readonly PRIORITY_COUNT = 4;

  static relationMappings: RelationMappings = {
    content: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Content',
      join: { from: 'tblnews.content_id', to: 'tblcontent.content_id' },
    },
    author: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/User',
      join: { from: 'tblnews.userid', to: 'user.userid' },
    },
  };
}
