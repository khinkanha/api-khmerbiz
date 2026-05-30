import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class News extends BaseModel {
    static tableName: string;
    static idColumn: string;
    id: number;
    content_id: number;
    description: string | null;
    userid: number;
    status: number;
    create_date: string | null;
    priority: number;
    publish_date: string | null;
    static readonly PRIORITY_COUNT = 4;
    static relationMappings: RelationMappings;
}
//# sourceMappingURL=News.d.ts.map