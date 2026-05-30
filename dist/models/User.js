"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class User extends BaseModel_1.BaseModel {
    static tableName = 'user';
    static idColumn = 'userid';
    userid;
    username;
    domain_id;
    full_name;
    phone;
    email;
    sitebuilder;
    user_level;
    password;
    verify_code;
    // Relations
    domain;
    static LEVEL_SUPER_ADMIN = -1;
    static LEVEL_WEB_ADMIN = 1;
    static LEVEL_NORMAL = 2;
    static relationMappings = {
        domain: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Domain',
            join: { from: 'user.domain_id', to: 'tbldomain.domain_id' },
        },
    };
    static async getByUsername(username) {
        return this.query().where('username', username).first();
    }
    static async isEmailExist(email) {
        const result = await this.query()
            .where('email', email)
            .count('userid as count')
            .first();
        return Number(result?.count) > 0;
    }
    static getLevelLabel(level) {
        switch (level) {
            case -1: return 'Super Admin';
            case 1: return 'Web Admin';
            case 2: return 'Normal';
            default: return 'Unknown';
        }
    }
    // Omit password from JSON output
    $formatJson(json) {
        json = super.$formatJson(json);
        delete json.password;
        delete json.verify_code;
        return json;
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map