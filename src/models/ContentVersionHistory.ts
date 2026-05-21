import { Model, RelationMappings } from 'objection';
import { BaseModel } from './BaseModel';

export class ContentVersionHistory extends BaseModel {
  static tableName = 'content_version_history';
  static idColumn = 'id';

  id!: number;
  content_id!: number;
  version!: number;
  title!: string | null;
  description!: string | null;
  created_by!: number;
  restoration_expires_at!: Date;

  static relationMappings: RelationMappings = {
    content: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/Content',
      join: { from: 'content_version_history.content_id', to: 'tblcontent.content_id' },
    },
    createdBy: {
      relation: Model.BelongsToOneRelation,
      modelClass: __dirname + '/User',
      join: { from: 'content_version_history.created_by', to: 'user.userid' },
    },
  };

  static async createVersion(
    contentId: number,
    contentData: {
      title: string;
      description: string | null;
    },
    userId: number
  ): Promise<ContentVersionHistory> {
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
      created_at: new Date().toISOString()
    });
  }

  static async getVersionHistory(contentId: number, limit: number = 10): Promise<ContentVersionHistory[]> {
    return await ContentVersionHistory.query()
      .where('content_id', contentId)
      .where('restoration_expires_at', '>', new Date())
      .orderBy('version', 'DESC')
      .limit(limit)
      .withGraphFetched('createdBy')
      .select('createdBy.full_name as created_by_name');
  }

  static async getLatestVersion(contentId: number): Promise<ContentVersionHistory | null> {
    const result = await ContentVersionHistory.query()
      .where('content_id', contentId)
      .where('restoration_expires_at', '>', new Date())
      .orderBy('version', 'DESC')
      .first();
    return result || null;
  }

  static async restoreVersion(versionId: number): Promise<ContentVersionHistory> {
    const version = await ContentVersionHistory.query().findById(versionId);
    if (!version) {
      throw new Error('Version not found or expired');
    }
    return version;
  }

  static async cleanupExpiredVersions(): Promise<number> {
    const deleted = await ContentVersionHistory.query()
      .where('restoration_expires_at', '<', new Date())
      .delete();
    return deleted;
  }
}
