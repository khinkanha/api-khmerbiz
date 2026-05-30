import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class ContentVersionHistory extends BaseModel {
    static tableName: string;
    static idColumn: string;
    id: number;
    content_id: number;
    version: number;
    title: string | null;
    description: string | null;
    created_by: number;
    restoration_expires_at: Date;
    static relationMappings: RelationMappings;
    static createVersion(contentId: number, contentData: {
        title: string;
        description: string | null;
    }, userId: number): Promise<ContentVersionHistory>;
    static getVersionHistory(contentId: number, limit?: number): Promise<ContentVersionHistory[]>;
    static getLatestVersion(contentId: number): Promise<ContentVersionHistory | null>;
    static restoreVersion(versionId: number): Promise<ContentVersionHistory>;
    static cleanupExpiredVersions(): Promise<number>;
}
//# sourceMappingURL=ContentVersionHistory.d.ts.map