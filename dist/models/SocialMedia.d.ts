import { BaseModel } from './BaseModel';
export declare class SocialMedia extends BaseModel {
    static tableName: string;
    static idColumn: string;
    smid: number;
    stype: number;
    link: string | null;
    domain_id: number;
    static readonly TYPE_GOOGLE = 1;
    static readonly TYPE_FACEBOOK = 2;
    static readonly TYPE_YOUTUBE = 3;
    static readonly TYPE_LINKEDIN = 4;
    static readonly TYPE_TWITTER = 5;
    static getTypeLabel(type: number): string;
    static listByDomain(domainId: number): Promise<SocialMedia[]>;
}
//# sourceMappingURL=SocialMedia.d.ts.map