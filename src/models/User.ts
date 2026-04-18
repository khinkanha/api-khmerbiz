import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
import type { Domain } from './Domain';

export class User extends BaseModel {
  static tableName = 'user';
  static idColumn = 'userid';

  userid!: number;
  username!: string;
  domain_id!: number;
  full_name!: string;
  phone!: string;
  email!: string;
  sitebuilder!: number;
  user_level!: number;
  password!: string;
  verify_code!: string | null;

  // Relations
  domain?: Domain;

  static readonly LEVEL_SUPER_ADMIN = -1;
  static readonly LEVEL_WEB_ADMIN = 1;
  static readonly LEVEL_NORMAL = 2;

  static relationMappings: RelationMappings = {
    domain: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Domain',
      join: { from: 'user.domain_id', to: 'tbldomain.domain_id' },
    },
  };

  static async getByUsername(username: string): Promise<User | undefined> {
    return this.query().where('username', username).first();
  }

  static async isEmailExist(email: string): Promise<boolean> {
    const result = await this.query()
      .where('email', email)
      .count('userid as count')
      .first();
    return Number((result as any)?.count) > 0;
  }

  static getLevelLabel(level: number): string {
    switch (level) {
      case -1: return 'Super Admin';
      case 1: return 'Web Admin';
      case 2: return 'Normal';
      default: return 'Unknown';
    }
  }

  // Omit password from JSON output
  $formatJson(json: Record<string, unknown>) {
    json = super.$formatJson(json);
    delete json.password;
    delete json.verify_code;
    return json;
  }
}
