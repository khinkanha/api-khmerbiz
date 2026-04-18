import { Model } from 'objection';
import { BaseModel } from './BaseModel';

export class Banner extends BaseModel {
  static tableName = 'tblbanner';
  static idColumn = 'banner_id';

  banner_id!: number;
  image!: string | null;
  domain_id!: number;
  title!: string | null;
  description!: string | null;
  lang_id!: number;

  static async listByDomain(domainId: number): Promise<Banner[]> {
    return this.query().where('domain_id', domainId);
  }
}
