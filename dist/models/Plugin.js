"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = void 0;
const BaseModel_1 = require("./BaseModel");
class Plugin extends BaseModel_1.BaseModel {
    static tableName = 'tblplugin';
    static idColumn = 'plid';
    plid;
    domain_id;
    desc;
    static async getByDomain(domainId) {
        return this.query().where('domain_id', domainId).first();
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Plugin.js.map