"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMedia = void 0;
const BaseModel_1 = require("./BaseModel");
class SocialMedia extends BaseModel_1.BaseModel {
    static tableName = 'tblsocial_media';
    static idColumn = 'smid';
    smid;
    stype;
    link;
    domain_id;
    static TYPE_GOOGLE = 1;
    static TYPE_FACEBOOK = 2;
    static TYPE_YOUTUBE = 3;
    static TYPE_LINKEDIN = 4;
    static TYPE_TWITTER = 5;
    static TYPE_TELEGRAM = 6;
    static TYPE_INSTAGRAM = 7;
    static getTypeLabel(type) {
        switch (type) {
            case SocialMedia.TYPE_GOOGLE: return 'Google';
            case SocialMedia.TYPE_FACEBOOK: return 'Facebook';
            case SocialMedia.TYPE_YOUTUBE: return 'YouTube';
            case SocialMedia.TYPE_LINKEDIN: return 'LinkedIn';
            case SocialMedia.TYPE_TWITTER: return 'Twitter';
            case SocialMedia.TYPE_TELEGRAM: return 'Telegram';
            case SocialMedia.TYPE_INSTAGRAM: return 'Instagram';
            default: return 'Unknown';
        }
    }
    static async listByDomain(domainId) {
        return this.query().where('domain_id', domainId);
    }
}
exports.SocialMedia = SocialMedia;
//# sourceMappingURL=SocialMedia.js.map