import { BaseModel } from './BaseModel';
export declare class DocumentType extends BaseModel {
    static tableName: string;
    static idColumn: string;
    typeid: number;
    description: string | null;
    static listAll(): Promise<DocumentType[]>;
}
//# sourceMappingURL=DocumentType.d.ts.map