"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const objection_1 = require("objection");
const BaseModel_1 = require("./BaseModel");
/**
 * A product/service item belonging to a Content record of type
 * Content.TYPE_PRODUCT (6). Detail fields (name, price, currency,
 * shortdes, longdes, features[], photos[]) are stored as JSON in the
 * `description` column — same convention as News.
 */
class Product extends BaseModel_1.BaseModel {
    static tableName = 'tblproduct';
    static idColumn = 'id';
    id;
    content_id;
    description;
    userid;
    status;
    create_date;
    priority;
    publish_date;
    static relationMappings = {
        content: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/Content',
            join: { from: 'tblproduct.content_id', to: 'tblcontent.content_id' },
        },
        author: {
            relation: objection_1.Model.BelongsToOneRelation,
            modelClass: __dirname + '/User',
            join: { from: 'tblproduct.userid', to: 'user.userid' },
        },
    };
}
exports.Product = Product;
//# sourceMappingURL=Product.js.map