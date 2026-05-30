"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIOperationLog = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class AIOperationLog extends BaseModel_1.BaseModel {
    static tableName = 'ai_operation_logs';
    static idColumn = 'id';
    id;
    user_id;
    domain_id;
    operation_type;
    target_type;
    target_id;
    operation_data;
    status;
    ip_address;
    user_agent;
    static relationMappings = {
        user: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/User',
            join: { from: 'ai_operation_logs.user_id', to: 'user.userid' },
        },
        domain: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Domain',
            join: { from: 'ai_operation_logs.domain_id', to: 'tbldomain.domain_id' },
        },
    };
    static async logOperation(data) {
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
    static async getUserOperationHistory(userId, domainId, limit = 50) {
        return await AIOperationLog.query()
            .where('user_id', userId)
            .where('domain_id', domainId)
            .orderBy('created_at', 'DESC')
            .limit(limit);
    }
    static async getRecentFailedOperations(limit = 10) {
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
    static async updateStatus(logId, status) {
        return await AIOperationLog.query()
            .patchAndFetchById(logId, { status });
    }
    static async getOperationsByTarget(targetType, targetId, domainId) {
        return await AIOperationLog.query()
            .where('target_type', targetType)
            .where('target_id', targetId)
            .where('domain_id', domainId)
            .orderBy('created_at', 'DESC')
            .limit(20);
    }
}
exports.AIOperationLog = AIOperationLog;
//# sourceMappingURL=AIOperationLog.js.map