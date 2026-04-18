import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class MenuItem extends BaseModel {
  static tableName = 'tblmenu_item';
  static idColumn = 'item_id';

  item_id!: number;
  item_name!: string | null;
  item_url!: string | null;
  parent_id!: number;
  item_order!: number;
  lang_id!: number;
  domain_id!: number;

  // Joined fields
  content_id?: number;
  title?: string;
  content_type?: number;
  parent_name?: string;

  static relationMappings: RelationMappings = {
    children: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/MenuItem',
      join: { from: 'tblmenu_item.item_id', to: 'tblmenu_item.parent_id' },
    },
    parent: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/MenuItem',
      join: { from: 'tblmenu_item.parent_id', to: 'tblmenu_item.item_id' },
    },
    content: {
      relation: Model.HasOneRelation,
      modelClass: __dirname + '/Content',
      join: { from: 'tblmenu_item.item_id', to: 'tblcontent.menu_id' },
    },
  };

  static async getMenuTree(domainId: number, langId: number): Promise<MenuItem[]> {
    return this.query()
      .where('domain_id', domainId)
      .where('lang_id', langId)
      .orderBy('item_order', 'asc');
  }

  static async getMaxOrder(langId: number): Promise<number> {
    const result = await this.query()
      .where('lang_id', langId)
      .max('item_order as maxOrder')
      .first();
    return (result?.maxOrder as number) || 0;
  }
}
