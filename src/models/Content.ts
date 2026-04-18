import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class Content extends BaseModel {
  static tableName = 'tblcontent';
  static idColumn = 'content_id';

  content_id!: number;
  description!: string | null;
  menu_id!: number;
  domain_id!: number;
  content_type!: number;
  userid!: number;
  status!: number;
  lang_id!: number;
  title!: string;

  static readonly TYPE_ARTICLE = 0;
  static readonly TYPE_PHOTO = 1;
  static readonly TYPE_VIDEO = 2;
  static readonly TYPE_DOCUMENT = 3;
  static readonly TYPE_NEWS = 4;
  static readonly TYPE_MAP = 5;

  static relationMappings: RelationMappings = {
    items: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/ContentItem',
      join: { from: 'tblcontent.content_id', to: 'tblcontent_item.content_id' },
    },
    menu: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/MenuItem',
      join: { from: 'tblcontent.menu_id', to: 'tblmenu_item.item_id' },
    },
    newsItems: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/News',
      join: { from: 'tblcontent.content_id', to: 'tblnews.content_id' },
    },
  };

  static getTypeLabel(type: number): string {
    switch (type) {
      case Content.TYPE_ARTICLE: return 'អត្ថបទ';
      case Content.TYPE_PHOTO: return 'រូបភាព';
      case Content.TYPE_VIDEO: return 'វីដេអូ';
      case Content.TYPE_DOCUMENT: return 'ឯកសារ';
      case Content.TYPE_MAP: return 'ផែនទី';
      case Content.TYPE_NEWS: return 'ពត៍មាន';
      default: return 'Unknown';
    }
  }

  static scopeDomain(query: any, domainId: number) {
    return query.where('domain_id', domainId).where('status', '!=', 2);
  }
}
