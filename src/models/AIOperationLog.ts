import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export type AIOperationType = 'create' | 'update' | 'delete' | 'ui_change';
export type AITargetType = 'content' | 'menu' | 'banner' | 'setting' | 'seo';
export type AIStatusType = 'pending' | 'completed' | 'failed' | 'rolled_back';

export class AIOperationLog extends BaseModel {
  static tableName = 'ai_operation_logs';
  static idColumn = 'id';

  id!: number;
  user_id!: number;
  domain_id!: number;
  operation_type!: AIOperationType;
  target_type!: AITargetType;
  target_id!: number | null;
  operation_data!: object;
  status!: AIStatusType;
  ip_address!: string | null;
  user_agent!: string | null;

  static relationMappings: RelationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/User',
      join: { from: 'ai_operation_logs.user_id', to: 'user.userid' },
    },
    domain: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Domain',
      join: { from: 'ai_operation_logs.domain_id', to: 'tbldomain.domain_id' },
    },
  };

  static async logOperation(data: {
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
  }): Promise<AIOperationLog> {
    return await AIOperationLog.query().insert({
      user_id: data.userId,
      domain_id: data.domainId,
      operation_type: data.operationType,
      target_type: data.targetType,
      target_id: data.targetId || null,
      operation_data: data.operationData,
      status: data.status || 'completed',
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      created_at: data.created_at || new Date().toISOString()
    });
  }

  static async getUserOperationHistory(
    userId: number,
    domainId: number,
    limit: number = 50
  ): Promise<AIOperationLog[]> {
    return await AIOperationLog.query()
      .where('user_id', userId)
      .where('domain_id', domainId)
      .orderBy('created_at', 'DESC')
      .limit(limit);
  }

  static async getRecentFailedOperations(limit: number = 10): Promise<AIOperationLog[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    return await AIOperationLog.query()
      .where('status', 'failed')
      .where('created_at', '>', yesterday)
      .orderBy('created_at', 'DESC')
      .limit(limit)
      .withGraphFetched('user')
      .withGraphFetched('domain');
  }

  static async updateStatus(logId: number, status: AIStatusType): Promise<AIOperationLog> {
    return await AIOperationLog.query()
      .patchAndFetchById(logId, { status });
  }

  static async getOperationsByTarget(
    targetType: AITargetType,
    targetId: number,
    domainId: number
  ): Promise<AIOperationLog[]> {
    return await AIOperationLog.query()
      .where('target_type', targetType)
      .where('target_id', targetId)
      .where('domain_id', domainId)
      .orderBy('created_at', 'DESC')
      .limit(20);
  }
}
