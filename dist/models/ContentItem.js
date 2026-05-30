"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentItem = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class ContentItem extends BaseModel_1.BaseModel {
    static tableName = 'tblcontent_item';
    static idColumn = 'item_id';
    item_id;
    create_date;
    title;
    url;
    upload_by;
    status;
    description;
    item_type;
    content_id;
    document_type;
    static relationMappings = {
        content: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Content',
            join: { from: 'tblcontent_item.content_id', to: 'tblcontent.content_id' },
        },
    };
}
exports.ContentItem = ContentItem;
//# sourceMappingURL=ContentItem.js.map