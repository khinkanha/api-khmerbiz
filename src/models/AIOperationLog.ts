import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export type AIOperationType = 'create' | 'update' | 'delete' | 'ui_change' | 'conversation';
export type AITargetType = 'content' | 'menu' | 'banner' | 'setting' | 'seo' | 'chat';
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
      created_at: data.created_at || new Date().toISOString().slice(0, 19).replace('T', ' ')
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

  /**
   * P2-6 (revised): Read recent conversation turns from the durable log to use as
   * AI memory. Returns the last `limit` completed exchanges in chronological order
   * (oldest first). Keyed by user + domain; replaces the Redis conversation cache so
   * memory survives Redis flush/restart and has no TTL.
   *
   * Returns the full exchange (assistant text + tool calls + tool results) so the
   * caller can faithfully reconstruct the prior turns — including what the model
   * did and what came back. Old rows written before tool-call replay existed are
   * tolerated: assistantToolCalls/toolResults default to empty.
   */
  static async getRecentConversationHistory(
    userId: number,
    domainId: number,
    limit: number = 10
  ): Promise<Array<{
    userMessage: string;
    assistantText: string;
    assistantToolCalls: Array<{ id: string; name: string; arguments: string }>;
    toolResults: any[];
  }>> {
    // id is auto-increment → reliable chronological order (created_at is second-precision and can tie)
    const rows = await AIOperationLog.query()
      .where('user_id', userId)
      .where('domain_id', domainId)
      .where('operation_type', 'conversation')
      .where('status', 'completed')
      .orderBy('id', 'desc')
      .limit(limit);

    return rows.reverse().map((r) => { // reverse → chronological (oldest first)
      const data = r.operation_data as {
        userMessage?: string;
        aiResponse?: string;        // legacy text field (kept for back-compat)
        assistantText?: string;
        assistantToolCalls?: Array<{ id: string; name: string; arguments: string }>;
        toolResults?: any[];
      };
      return {
        userMessage: data.userMessage || '',
        assistantText: data.assistantText ?? data.aiResponse ?? '',
        assistantToolCalls: Array.isArray(data.assistantToolCalls) ? data.assistantToolCalls : [],
        toolResults: Array.isArray(data.toolResults) ? data.toolResults : [],
      };
    });
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

  /**
   * P3-9: Log a full AI conversation exchange (user message + AI response + tool
   * calls + tool results). The assistant text, tool calls, and tool results are all
   * persisted so the turn can be faithfully replayed as AI memory in later requests.
   */
  static async logConversation(data: {
    userId: number;
    domainId: number;
    userMessage: string;
    aiResponse: string;
    assistantToolCalls?: Array<{ id: string; name: string; arguments: string }>;
    toolResults?: object[];
    usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AIOperationLog> {
    return await AIOperationLog.query().insert({
      user_id: data.userId,
      domain_id: data.domainId,
      operation_type: 'conversation',
      target_type: 'chat',
      target_id: null,
      operation_data: {
        userMessage: data.userMessage.slice(0, 5000),
        // Keep both the legacy `aiResponse` key (read by the history UI) and the
        // explicit `assistantText` key used by memory replay.
        aiResponse: data.aiResponse?.slice(0, 10000) || '',
        assistantText: data.aiResponse?.slice(0, 10000) || '',
        assistantToolCalls: data.assistantToolCalls || [],
        toolResults: data.toolResults || [],
        usage: data.usage || null,
      },
      status: 'completed',
      ip_address: data.ipAddress || null,
      user_agent: data.userAgent || null,
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
  }

  /**
   * P4-14: Get a rollbackable operation by ID and domain.
   */
  static async getRollbackableOperation(
    operationId: number,
    domainId: number
  ): Promise<AIOperationLog | null> {
    const result = await AIOperationLog.query()
      .where('id', operationId)
      .where('domain_id', domainId)
      .where('status', 'completed')
      .whereIn('operation_type', ['create', 'update', 'delete'])
      .first();
    return result ?? null;
  }
}
