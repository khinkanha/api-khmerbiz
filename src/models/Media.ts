import { Model } from 'objection';
import { BaseModel } from './BaseModel';

export class Media extends BaseModel {
  static tableName = 'tblphotos';
  static idColumn = 'photo_id';

  photo_id!: number;
  file_name!: string | null;
  title!: string | null;
  server_id!: number;
  domain_id!: number;
  code!: string | null;

  static readonly LIMIT_FILES = 500;

  static async countByDomain(domainId: number): Promise<number> {
    const result = await this.query()
      .where('domain_id', domainId)
      .count('photo_id as count')
      .first();
    return (result?.count as number) || 0;
  }

  static async isExist(code: string, domainId: number): Promise<boolean> {
    const result = await this.query()
      .where('code', code)
      .where('domain_id', domainId)
      .first();
    return !!result;
  }
}
