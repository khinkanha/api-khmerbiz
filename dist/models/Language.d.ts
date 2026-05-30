import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class Language extends BaseModel {
    static tableName: string;
    static idColumn: string;
    lang_id: number;
    lang_name: string;
    flag: number;
    domain_id: number;
    is_default: number;
    static readonly FLAG_KH = 0;
    static readonly FLAG_EN = 1;
    static readonly FLAG_CH = 2;
    static readonly FLAG_TH = 3;
    static readonly FLAG_VN = 4;
    static relationMappings: RelationMappings;
    static listByDomain(domainId: number): Promise<Language[]>;
    static getDefault(domainId: number): Promise<Language | undefined>;
    static countByDomain(domainId: number): Promise<number>;
}
//# sourceMappingURL=Language.d.ts.map