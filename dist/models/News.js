"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.News = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class News extends BaseModel_1.BaseModel {
    static tableName = 'tblnews';
    static idColumn = 'id';
    id;
    content_id;
    description;
    userid;
    status;
    create_date;
    priority;
    publish_date;
    static PRIORITY_COUNT = 4;
    static relationMappings = {
        content: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Content',
            join: { from: 'tblnews.content_id', to: 'tblcontent.content_id' },
        },
        author: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/User',
            join: { from: 'tblnews.userid', to: 'user.userid' },
        },
    };
}
exports.News = News;
//# sourceMappingURL=News.js.map