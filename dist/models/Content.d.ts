import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class Content extends BaseModel {
    static tableName: string;
    static idColumn: string;
    content_id: number;
    description: string | null;
    menu_id: number;
    domain_id: number;
    content_type: number;
    userid: number;
    status: number;
    lang_id: number;
    title: string;
    static readonly TYPE_ARTICLE = 0;
    static readonly TYPE_PHOTO = 1;
    static readonly TYPE_VIDEO = 2;
    static readonly TYPE_DOCUMENT = 3;
    static readonly TYPE_NEWS = 4;
    static readonly TYPE_MAP = 5;
    static relationMappings: RelationMappings;
    static getTypeLabel(type: number): string;
    static scopeDomain(query: any, domainId: number): any;
}
//# sourceMappingURL=Content.d.ts.map