"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Content = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class Content extends BaseModel_1.BaseModel {
    static tableName = 'tblcontent';
    static idColumn = 'content_id';
    content_id;
    description;
    menu_id;
    domain_id;
    content_type;
    userid;
    status;
    lang_id;
    title;
    static TYPE_ARTICLE = 0;
    static TYPE_PHOTO = 1;
    static TYPE_VIDEO = 2;
    static TYPE_DOCUMENT = 3;
    static TYPE_NEWS = 4;
    static TYPE_MAP = 5;
    static relationMappings = {
        items: {
            relation: objection_1.Model.HasManyRelation,
            modelClass: __dirname + '/ContentItem',
            join: { from: 'tblcontent.content_id', to: 'tblcontent_item.content_id' },
        },
        menu: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/MenuItem',
            join: { from: 'tblcontent.menu_id', to: 'tblmenu_item.item_id' },
        },
        newsItems: {
            relation: objection_1.Model.HasManyRelation,
            modelClass: __dirname + '/News',
            join: { from: 'tblcontent.content_id', to: 'tblnews.content_id' },
        },
    };
    static getTypeLabel(type) {
        switch (type) {
            case Content.TYPE_ARTICLE: return 'អត្ថបទ';
            case Content.TYPE_PHOTO: return 'រូបភាព';
            case Content.TYPE_VIDEO: return 'វីដេអូ';
            case Content.TYPE_DOCUMENT: return 'ឯកសារ';
            case Content.TYPE_MAP: return 'ផែនទី';
            case Content.TYPE_NEWS: return 'ពត៍មាន';
            default: return 'Unknown';
        }
    }
    static scopeDomain(query, domainId) {
        return query.where('domain_id', domainId).where('status', '!=', 2);
    }
}
exports.Content = Content;
//# sourceMappingURL=Content.js.map