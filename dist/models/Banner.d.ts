import { BaseModel } from './BaseModel';
export declare class Banner extends BaseModel {
    static tableName: string;
    static idColumn: string;
    banner_id: number;
    image: string | null;
    domain_id: number;
    title: string | null;
    description: string | null;
    lang_id: number;
    static listByDomain(domainId: number): Promise<Banner[]>;
}
//# sourceMappingURL=Banner.d.ts.map