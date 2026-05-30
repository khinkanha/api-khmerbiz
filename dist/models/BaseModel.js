"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseModel = void 0;
const objection_1 = require("objection");
class BaseModel extends objection_1.Model {
    // Created at / updated at timestamps (if columns exist)
    created_at;
    updated_at;
    static get modelPaths() {
        return [__dirname];
    }
    async $beforeInsert(queryContext) {
        await super.$beforeInsert(queryContext);
    }
    async $beforeUpdate(opt, queryContext) {
        await super.$beforeUpdate(opt, queryContext);
    }
    static async pullById(id) {
        return this.query().findById(id);
    }
}
exports.BaseModel = BaseModel;
//# sourceMappingURL=BaseModel.js.map