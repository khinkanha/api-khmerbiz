"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Banner = void 0;
const BaseModel_1 = require("./BaseModel");
class Banner extends BaseModel_1.BaseModel {
    static tableName = 'tblbanner';
    static idColumn = 'banner_id';
    banner_id;
    image;
    domain_id;
    title;
    description;
    lang_id;
    static async listByDomain(domainId) {
        return this.query().where('domain_id', domainId);
    }
}
exports.Banner = Banner;
//# sourceMappingURL=Banner.js.map