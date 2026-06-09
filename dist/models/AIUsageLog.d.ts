import { RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
export declare class AIUsageLog extends BaseModel {
    static tableName: string;
    static idColumn: string;
    id: number;
    user_id: number;
    domain_id: number;
    question_date: string | Date;
    questions_count: number;
    static relationMappings: RelationMappings;
    static getUsageCount(userId: number, domainId: number): Promise<number>;
    static incrementUsage(userId: number, domainId: number): Promise<AIUsageLog>;
    static getUsageInfo(userId: number, domainId: number): Promise<{
        remaining_questions: number;
        daily_limit: number;
        questions_count: number;
        reset_at: string;
        total_tokens_used: number;
    }>;
    /**
     * #13: Increment the daily token counter in Redis.
     */
    static incrementTokenUsage(domainId: number, totalTokens: number): Promise<void>;
}
//# sourceMappingURL=AIUsageLog.d.ts.map