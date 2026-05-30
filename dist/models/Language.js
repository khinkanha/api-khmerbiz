"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Language = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class Language extends BaseModel_1.BaseModel {
    static tableName = 'tbllanguage';
    static idColumn = 'lang_id';
    lang_id;
    lang_name;
    flag;
    domain_id;
    is_default;
    static FLAG_KH = 0;
    static FLAG_EN = 1;
    static FLAG_CH = 2;
    static FLAG_TH = 3;
    static FLAG_VN = 4;
    static relationMappings = {
        domain: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Domain',
            join: { from: 'tbllanguage.domain_id', to: 'tbldomain.domain_id' },
        },
    };
    static async listByDomain(domainId) {
        return this.query().where('domain_id', domainId);
    }
    static async getDefault(domainId) {
        return this.query().where('domain_id', domainId).where('is_default', 1).first();
    }
    static async countByDomain(domainId) {
        const result = await this.query()
            .where('domain_id', domainId)
            .count('lang_id as count')
            .first();
        return Number(result?.count) || 0;
    }
}
exports.Language = Language;
//# sourceMappingURL=Language.js.map