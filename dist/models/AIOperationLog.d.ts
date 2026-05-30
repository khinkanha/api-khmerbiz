import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export type AIOperationType = 'create' | 'update' | 'delete' | 'ui_change';
export type AITargetType = 'content' | 'menu' | 'banner' | 'setting' | 'seo';
export type AIStatusType = 'pending' | 'completed' | 'failed' | 'rolled_back';
export declare class AIOperationLog extends BaseModel {
    static tableName: string;
    static idColumn: string;
    id: number;
    user_id: number;
    domain_id: number;
    operation_type: AIOperationType;
    target_type: AITargetType;
    target_id: number | null;
    operation_data: object;
    status: AIStatusType;
    ip_address: string | null;
    user_agent: string | null;
    static relationMappings: RelationMappings;
    static logOperation(data: {
        userId: number;
        domainId: number;
        operationType: AIOperationType;
        targetType: AITargetType;
        targetId?: number;
        operationData: object;
        status?: AIStatusType;
        ipAddress?: string;
        userAgent?: string;
        created_at?: string;
    }): Promise<AIOperationLog>;
    static getUserOperationHistory(userId: number, domainId: number, limit?: number): Promise<AIOperationLog[]>;
    static getRecentFailedOperations(limit?: number): Promise<AIOperationLog[]>;
    static updateStatus(logId: number, status: AIStatusType): Promise<AIOperationLog>;
    static getOperationsByTarget(targetType: AITargetType, targetId: number, domainId: number): Promise<AIOperationLog[]>;
}
//# sourceMappingURL=AIOperationLog.d.ts.map