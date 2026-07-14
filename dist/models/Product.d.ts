import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
/**
 * A product/service item belonging to a Content record of type
 * Content.TYPE_PRODUCT (6). Detail fields (name, price, currency,
 * shortdes, longdes, features[], photos[]) are stored as JSON in the
 * `description` column — same convention as News.
 */
export declare class Product extends BaseModel {
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
    static relationMappings: RelationMappings;
}
//# sourceMappingURL=Product.d.ts.map