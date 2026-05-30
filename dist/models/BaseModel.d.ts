import { Model, ModelOptions, QueryContext } from 'objection';
export declare class BaseModel extends Model {
    created_at: string | null;
    updated_at: string | null;
    static get modelPaths(): string[];
    $beforeInsert(queryContext: QueryContext): Promise<void>;
    $beforeUpdate(opt: ModelOptions, queryContext: QueryContext): Promise<void>;
    static pullById(id: number | string): Promise<BaseModel | undefined>;
}
//# sourceMappingURL=BaseModel.d.ts.map