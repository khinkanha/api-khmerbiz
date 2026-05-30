"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Media = void 0;
const BaseModel_1 = require("./BaseModel");
class Media extends BaseModel_1.BaseModel {
    static tableName = 'tblphotos';
    static idColumn = 'photo_id';
    photo_id;
    file_name;
    title;
    server_id;
    domain_id;
    code;
    static LIMIT_FILES = 500;
    static async countByDomain(domainId) {
        const result = await this.query()
            .where('domain_id', domainId)
            .count('photo_id as count')
            .first();
        return Number(result?.count) || 0;
    }
    static async isExist(code, domainId) {
        const result = await this.query()
            .where('code', code)
            .where('domain_id', domainId)
            .first();
        return !!result;
    }
}
exports.Media = Media;
//# sourceMappingURL=Media.js.map