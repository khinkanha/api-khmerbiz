import { BaseModel } from './BaseModel';
export declare class Plugin extends BaseModel {
    static tableName: string;
    static idColumn: string;
    plid: number;
    domain_id: number;
    desc: string | null;
    static getByDomain(domainId: number): Promise<Plugin | undefined>;
}
//# sourceMappingURL=Plugin.d.ts.map