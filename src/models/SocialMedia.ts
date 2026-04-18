import { Model } from 'objection';
import { BaseModel } from './BaseModel';

export class SocialMedia extends BaseModel {
  static tableName = 'tblsocial_media';
  static idColumn = 'smid';

  smid!: number;
  stype!: number;
  link!: string | null;
  domain_id!: number;

  static readonly TYPE_GOOGLE = 1;
  static readonly TYPE_FACEBOOK = 2;
  static readonly TYPE_YOUTUBE = 3;
  static readonly TYPE_LINKEDIN = 4;
  static readonly TYPE_TWITTER = 5;

  static getTypeLabel(type: number): string {
    switch (type) {
      case SocialMedia.TYPE_GOOGLE: return 'Google';
      case SocialMedia.TYPE_FACEBOOK: return 'Facebook';
      case SocialMedia.TYPE_YOUTUBE: return 'YouTube';
      case SocialMedia.TYPE_LINKEDIN: return 'LinkedIn';
      case SocialMedia.TYPE_TWITTER: return 'Twitter';
      default: return 'Unknown';
    }
  }

  static async listByDomain(domainId: number): Promise<SocialMedia[]> {
    return this.query().where('domain_id', domainId);
  }
}
