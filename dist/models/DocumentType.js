"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentType = void 0;
const BaseModel_1 = require("./BaseModel");
class DocumentType extends BaseModel_1.BaseModel {
    static tableName = 'doctype';
    static idColumn = 'typeid';
    typeid;
    description;
    static async listAll() {
        return this.query();
    }
}
exports.DocumentType = DocumentType;
//# sourceMappingURL=DocumentType.js.map