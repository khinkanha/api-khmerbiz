import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

/**
 * A product/service item belonging to a Content record of type
 * Content.TYPE_PRODUCT (6). Detail fields (name, price, currency,
 * shortdes, longdes, features[], photos[]) are stored as JSON in the
 * `description` column — same convention as News.
 */
export class Product extends BaseModel {
  static tableName = 'tblproduct';
  static idColumn = 'id';

  id!: number;
  content_id!: number;
  description!: string | null;
  userid!: number;
  status!: number;
  create_date!: string | null;
  priority!: number;
  publish_date!: string | null;

  static relationMappings: RelationMappings = {
    content: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Content',
      join: { from: 'tblproduct.content_id', to: 'tblcontent.content_id' },
    },
    author: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/User',
      join: { from: 'tblproduct.userid', to: 'user.userid' },
    },
  };
}
