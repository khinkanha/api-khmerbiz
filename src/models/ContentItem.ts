import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class ContentItem extends BaseModel {
  static tableName = 'tblcontent_item';
  static idColumn = 'item_id';

  item_id!: number;
  create_date!: string | null;
  title!: string;
  url!: string | null;
  upload_by!: number;
  status!: number;
  description!: string | null;
  item_type!: number;
  content_id!: number;
  document_type!: string | null;

  static relationMappings: RelationMappings = {
    content: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Content',
      join: { from: 'tblcontent_item.content_id', to: 'tblcontent.content_id' },
    },
  };
}
