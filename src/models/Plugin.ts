import { Model } from 'objection';
import { BaseModel } from './BaseModel';

export class Plugin extends BaseModel {
  static tableName = 'tblplugin';
  static idColumn = 'plid';

  plid!: number;
  domain_id!: number;
  desc!: string | null;

  static async getByDomain(domainId: number): Promise<Plugin | undefined> {
    return this.query().where('domain_id', domainId).first();
  }
}
