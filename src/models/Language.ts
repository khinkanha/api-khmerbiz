import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class Language extends BaseModel {
  static tableName = 'tbllanguage';
  static idColumn = 'lang_id';

  lang_id!: number;
  lang_name!: string;
  flag!: number;
  domain_id!: number;
  is_default!: number;

  static readonly FLAG_KH = 0;
  static readonly FLAG_EN = 1;
  static readonly FLAG_CH = 2;
  static readonly FLAG_TH = 3;
  static readonly FLAG_VN = 4;

  static relationMappings: RelationMappings = {
    domain: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Domain',
      join: { from: 'tbllanguage.domain_id', to: 'tbldomain.domain_id' },
    },
  };

  static async listByDomain(domainId: number): Promise<Language[]> {
    return this.query().where('domain_id', domainId);
  }

  static async getDefault(domainId: number): Promise<Language | undefined> {
    return this.query().where('domain_id', domainId).where('is_default', 1).first();
  }

  static async countByDomain(domainId: number): Promise<number> {
    const result = await this.query()
      .where('domain_id', domainId)
      .count('lang_id as count')
      .first();
    return (result?.count as number) || 0;
  }
}
