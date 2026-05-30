"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuItem = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
class MenuItem extends BaseModel_1.BaseModel {
    static tableName = 'tblmenu_item';
    static idColumn = 'item_id';
    item_id;
    item_name;
    item_url;
    parent_id;
    item_order;
    lang_id;
    domain_id;
    // Joined fields
    content_id;
    title;
    content_type;
    parent_name;
    static relationMappings = {
        children: {
            relation: objection_1.Model.HasManyRelation,
            modelClass: __dirname + '/MenuItem',
            join: { from: 'tblmenu_item.item_id', to: 'tblmenu_item.parent_id' },
        },
        parent: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/MenuItem',
            join: { from: 'tblmenu_item.parent_id', to: 'tblmenu_item.item_id' },
        },
        content: {
            relation: objection_1.Model.HasOneRelation,
            modelClass: __dirname + '/Content',
            join: { from: 'tblmenu_item.item_id', to: 'tblcontent.menu_id' },
        },
    };
    static async getMenuTree(domainId, langId) {
        return this.query()
            .where('domain_id', domainId)
            .where('lang_id', langId)
            .orderBy('item_order', 'asc');
    }
    static async getMaxOrder(langId) {
        const result = await this.query()
            .where('lang_id', langId)
            .max('item_order as maxOrder')
            .first();
        return Number(result?.maxOrder) || 0;
    }
}
exports.MenuItem = MenuItem;
//# sourceMappingURL=MenuItem.js.map