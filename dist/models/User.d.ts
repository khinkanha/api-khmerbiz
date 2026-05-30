import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
import type { Domain } from './Domain';
export declare class User extends BaseModel {
    static tableName: string;
    static idColumn: string;
    userid: number;
    username: string;
    domain_id: number;
    full_name: string;
    phone: string;
    email: string;
    sitebuilder: number;
    user_level: number;
    password: string;
    verify_code: string | null;
    domain?: Domain;
    static readonly LEVEL_SUPER_ADMIN = -1;
    static readonly LEVEL_WEB_ADMIN = 1;
    static readonly LEVEL_NORMAL = 2;
    static relationMappings: RelationMappings;
    static getByUsername(username: string): Promise<User | undefined>;
    static isEmailExist(email: string): Promise<boolean>;
    static getLevelLabel(level: number): string;
    $formatJson(json: Record<string, unknown>): Record<string, unknown>;
}
//# sourceMappingURL=User.d.ts.map