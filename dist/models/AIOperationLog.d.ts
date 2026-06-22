import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export type AIOperationType = 'create' | 'update' | 'delete' | 'ui_change' | 'conversation';
export type AITargetType = 'content' | 'menu' | 'banner' | 'setting' | 'seo' | 'chat';
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
    /**
     * P2-6 (revised): Read recent conversation turns from the durable log to use as
     * AI memory. Returns the last `limit` completed exchanges in chronological order
     * (oldest first). Keyed by user + domain; replaces the Redis conversation cache so
     * memory survives Redis flush/restart and has no TTL.
     */
    static getRecentConversationHistory(userId: number, domainId: number, limit?: number): Promise<Array<{
        userMessage: string;
        aiResponse: string;
    }>>;
    static getRecentFailedOperations(limit?: number): Promise<AIOperationLog[]>;
    static updateStatus(logId: number, status: AIStatusType): Promise<AIOperationLog>;
    static getOperationsByTarget(targetType: AITargetType, targetId: number, domainId: number): Promise<AIOperationLog[]>;
    /**
     * P3-9: Log a full AI conversation exchange (user message + AI response + tool results).
     */
    static logConversation(data: {
        userId: number;
        domainId: number;
        userMessage: string;
        aiResponse: string;
        toolResults?: object[];
        usage?: {
            promptTokens: number;
            completionTokens: number;
            totalTokens: number;
        };
        ipAddress?: string;
        userAgent?: string;
    }): Promise<AIOperationLog>;
    /**
     * P4-14: Get a rollbackable operation by ID and domain.
     */
    static getRollbackableOperation(operationId: number, domainId: number): Promise<AIOperationLog | null>;
}
//# sourceMappingURL=AIOperationLog.d.ts.map