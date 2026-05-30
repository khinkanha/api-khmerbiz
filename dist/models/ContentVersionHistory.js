"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentVersionHistory = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class ContentVersionHistory extends BaseModel_1.BaseModel {
    static tableName = 'content_version_history';
    static idColumn = 'id';
    id;
    content_id;
    version;
    title;
    description;
    created_by;
    restoration_expires_at;
    static relationMappings = {
        content: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Content',
            join: { from: 'content_version_history.content_id', to: 'tblcontent.content_id' },
        },
        createdBy: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/User',
            join: { from: 'content_version_history.created_by', to: 'user.userid' },
        },
    };
    static async createVersion(contentId, contentData, userId) {
        const latestVersion = await ContentVersionHistory.query()
            .where('content_id', contentId)
            .orderBy('version', 'DESC')
            .first();
        const newVersion = (latestVersion?.version || 0) + 1;
        const restorationExpiresAt = new Date();
        restorationExpiresAt.setDate(restorationExpiresAt.getDate() + 30);
        return await ContentVersionHistory.query().insert({
            content_id: contentId,
            version: newVersion,
            title: contentData.title,
            description: contentData.description,
            created_by: userId,
            restoration_expires_at: restorationExpiresAt,
            created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        });
    }
    static async getVersionHistory(contentId, limit = 10) {
        return await ContentVersionHistory.query()
            .where('content_id', contentId)
            .where('restoration_expires_at', '>', new Date())
            .orderBy('version', 'DESC')
            .limit(limit)
            .withGraphFetched('createdBy')
            .select('createdBy.full_name as created_by_name');
    }
    static async getLatestVersion(contentId) {
        const result = await ContentVersionHistory.query()
            .where('content_id', contentId)
            .where('restoration_expires_at', '>', new Date())
            .orderBy('version', 'DESC')
            .first();
        return result || null;
    }
    static async restoreVersion(versionId) {
        const version = await ContentVersionHistory.query().findById(versionId);
        if (!version) {
            throw new Error('Version not found or expired');
        }
        return version;
    }
    static async cleanupExpiredVersions() {
        const deleted = await ContentVersionHistory.query()
            .where('restoration_expires_at', '<', new Date())
            .delete();
        return deleted;
    }
}
exports.ContentVersionHistory = ContentVersionHistory;
//# sourceMappingURL=ContentVersionHistory.js.map