import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class ContentItem extends BaseModel {
    static tableName: string;
    static idColumn: string;
    item_id: number;
    create_date: string | null;
    title: string;
    url: string | null;
    upload_by: number;
    status: number;
    description: string | null;
    item_type: number;
    content_id: number;
    document_type: string | null;
    static relationMappings: RelationMappings;
}
//# sourceMappingURL=ContentItem.d.ts.map