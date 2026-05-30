import { BaseModel } from './BaseModel';
export declare class Media extends BaseModel {
    static tableName: string;
    static idColumn: string;
    photo_id: number;
    file_name: string | null;
    title: string | null;
    server_id: number;
    domain_id: number;
    code: string | null;
    static readonly LIMIT_FILES = 500;
    static countByDomain(domainId: number): Promise<number>;
    static isExist(code: string, domainId: number): Promise<boolean>;
}
//# sourceMappingURL=Media.d.ts.map