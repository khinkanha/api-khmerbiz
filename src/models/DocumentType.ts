import { Model } from 'objection';
import { BaseModel } from './BaseModel';

export class DocumentType extends BaseModel {
  static tableName = 'doctype';
  static idColumn = 'typeid';

  typeid!: number;
  description!: string | null;

  static async listAll(): Promise<DocumentType[]> {
    return this.query();
  }
}
