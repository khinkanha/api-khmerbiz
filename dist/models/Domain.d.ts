import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class Domain extends BaseModel {
    static tableName: string;
    static idColumn: string;
    domain_id: number;
    domain_name: string | null;
    company_address: string | null;
    company_desc: string | null;
    company_name: string | null;
    phone_number: string | null;
    email: string | null;
    status: number;
    start_date: string | null;
    expire_date: string | null;
    file_limit: number;
    menu_cache: string | null;
    lang_cache: string | null;
    static readonly ACTIVE = 1;
    static readonly SUSPEND = 2;
    static readonly EXPIRED = 3;
    static relationMappings: RelationMappings;
    static getByName(domainName: string): Promise<Domain | undefined>;
    static getStatusLabel(status: number): string | null;
    clearCache(): Promise<void>;
}
//# sourceMappingURL=Domain.d.ts.map