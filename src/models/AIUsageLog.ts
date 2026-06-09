import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';
import { redis } from '../config/redis';

export class AIUsageLog extends BaseModel {
  static tableName = 'ai_usage_logs';
  static idColumn = 'id';

  id!: number;
  user_id!: number;
  domain_id!: number;
  question_date!: string | Date;
  questions_count!: number;

  static relationMappings: RelationMappings = {
    user: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/User',
      join: { from: 'ai_usage_logs.user_id', to: 'user.userid' },
    },
    domain: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Domain',
      join: { from: 'ai_usage_logs.domain_id', to: 'tbldomain.domain_id' },
    },
  };

  static async getUsageCount(userId: number, domainId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await AIUsageLog.query()
      .where('user_id', userId)
      .where('domain_id', domainId)
      .where('question_date', '>=', today)
      .first();

    return log?.questions_count || 0;
  }

  static async incrementUsage(userId: number, domainId: number): Promise<AIUsageLog> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    let log = await AIUsageLog.query()
      .where('user_id', userId)
      .where('domain_id', domainId)
      .where('question_date', '>=', today)
      .first();

    if (log) {
      log = await AIUsageLog.query()
        .patchAndFetchById(log.id, {
          questions_count: log.questions_count + 1,
          updated_at: now
        });
    } else {
      log = await AIUsageLog.query().insert({
        user_id: userId,
        domain_id: domainId,
        question_date: today.toISOString().slice(0, 19).replace('T', ' '),
        questions_count: 1,
        created_at: now
      });
    }

    return log;
  }

  static async getUsageInfo(userId: number, domainId: number): Promise<{
    remaining_questions: number;
    daily_limit: number;
    questions_count: number;
    reset_at: string;
    total_tokens_used: number;
  }> {
    const DAILY_LIMIT = 10;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await AIUsageLog.query()
      .where('user_id', userId)
      .where('domain_id', domainId)
      .where('question_date', '>=', today)
      .first();

    const questionsCount = log?.questions_count || 0;
    const remaining = Math.max(0, DAILY_LIMIT - questionsCount);

    const resetAt = new Date(today);
    resetAt.setDate(resetAt.getDate() + 1);

    // #13: Token usage from Redis counter (replaces N+1 query)
    let totalTokensUsed = 0;
    try {
      const tokenKey = `ai:tokens:daily:${domainId}`;
      const stored = await redis.get(tokenKey);
      totalTokensUsed = stored ? parseInt(stored, 10) : 0;
    } catch {
      // Redis unavailable — return 0
    }

    return {
      remaining_questions: remaining,
      daily_limit: DAILY_LIMIT,
      questions_count: questionsCount,
      reset_at: resetAt.toISOString(),
      total_tokens_used: totalTokensUsed,
    };
  }

  /**
   * #13: Increment the daily token counter in Redis.
   */
  static async incrementTokenUsage(domainId: number, totalTokens: number): Promise<void> {
    try {
      const key = `ai:tokens:daily:${domainId}`;
      const current = parseInt(await redis.get(key) || '0', 10);
      const ttl = Math.ceil((new Date().setHours(24, 0, 0, 0) - Date.now()) / 1000);
      if (current === 0 && ttl > 0) {
        await redis.setex(key, ttl, String(current + totalTokens));
      } else {
        await redis.set(key, String(current + totalTokens));
      }
    } catch {
      // Best-effort
    }
  }
}
