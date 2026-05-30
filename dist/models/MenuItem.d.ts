import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class MenuItem extends BaseModel {
    static tableName: string;
    static idColumn: string;
    item_id: number;
    item_name: string | null;
    item_url: string | null;
    parent_id: number;
    item_order: number;
    lang_id: number;
    domain_id: number;
    content_id?: number;
    title?: string;
    content_type?: number;
    parent_name?: string;
    static relationMappings: RelationMappings;
    static getMenuTree(domainId: number, langId: number): Promise<MenuItem[]>;
    static getMaxOrder(langId: number): Promise<number>;
}
//# sourceMappingURL=MenuItem.d.ts.map