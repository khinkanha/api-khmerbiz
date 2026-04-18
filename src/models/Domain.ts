import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class Domain extends BaseModel {
  static tableName = 'tbldomain';
  static idColumn = 'domain_id';

  domain_id!: number;
  domain_name!: string | null;
  company_address!: string | null;
  company_desc!: string | null;
  company_name!: string | null;
  phone_number!: string | null;
  email!: string | null;
  status!: number;
  start_date!: string | null;
  expire_date!: string | null;
  file_limit!: number;
  menu_cache!: string | null;
  lang_cache!: string | null;

  static readonly ACTIVE = 1;
  static readonly SUSPEND = 2;
  static readonly EXPIRED = 3;

  static relationMappings: RelationMappings = {
    settings: {
      relation: Model.HasOneRelation,
      modelClass: __dirname + '/Setting',
      join: { from: 'tbldomain.domain_id', to: 'tblsetting.domain_id' },
    },
    languages: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/Language',
      join: { from: 'tbldomain.domain_id', to: 'tbllanguage.domain_id' },
    },
    banners: {
      relation: Model.HasManyRelation,
      modelClass: __dirname + '/Banner',
      join: { from: 'tbldomain.domain_id', to: 'tblbanner.domain_id' },
    },
  };

  static async getByName(domainName: string): Promise<Domain | undefined> {
    return this.query()
      .where('domain_name', domainName)
      .first();
  }

  static getStatusLabel(status: number): string | null {
    switch (status) {
      case Domain.ACTIVE: return 'ACTIVE';
      case Domain.EXPIRED: return 'EXPIRED';
      case Domain.SUSPEND: return 'SUSPENDED';
      default: return null;
    }
  }

  async clearCache(): Promise<void> {
    await Domain.query()
      .patch({ menu_cache: null, lang_cache: null })
      .where('domain_id', this.domain_id);
  }
}
