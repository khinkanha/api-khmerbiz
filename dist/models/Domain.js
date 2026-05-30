"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Domain = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class Domain extends BaseModel_1.BaseModel {
    static tableName = 'tbldomain';
    static idColumn = 'domain_id';
    domain_id;
    domain_name;
    company_address;
    company_desc;
    company_name;
    phone_number;
    email;
    status;
    start_date;
    expire_date;
    file_limit;
    menu_cache;
    lang_cache;
    static ACTIVE = 1;
    static SUSPEND = 2;
    static EXPIRED = 3;
    static relationMappings = {
        settings: {
            relation: objection_1.Model.HasOneRelation,
            modelClass: __dirname + '/Setting',
            join: { from: 'tbldomain.domain_id', to: 'tblsetting.domain_id' },
        },
        languages: {
            relation: objection_1.Model.HasManyRelation,
            modelClass: __dirname + '/Language',
            join: { from: 'tbldomain.domain_id', to: 'tbllanguage.domain_id' },
        },
        banners: {
            relation: objection_1.Model.HasManyRelation,
            modelClass: __dirname + '/Banner',
            join: { from: 'tbldomain.domain_id', to: 'tblbanner.domain_id' },
        },
    };
    static async getByName(domainName) {
        return this.query()
            .where('domain_name', domainName)
            .first();
    }
    static getStatusLabel(status) {
        switch (status) {
            case Domain.ACTIVE: return 'ACTIVE';
            case Domain.EXPIRED: return 'EXPIRED';
            case Domain.SUSPEND: return 'SUSPENDED';
            default: return null;
        }
    }
    async clearCache() {
        await Domain.query()
            .patch({ menu_cache: null, lang_cache: null })
            .where('domain_id', this.domain_id);
    }
}
exports.Domain = Domain;
//# sourceMappingURL=Domain.js.map