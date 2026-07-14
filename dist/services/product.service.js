"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listProducts = listProducts;
exports.getProduct = getProduct;
exports.createProduct = createProduct;
exports.updateProduct = updateProduct;
exports.deleteProduct = deleteProduct;
const Product_1 = require("../models/Product");
const Content_1 = require("../models/Content");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const cache_1 = require("../middleware/cache");
const content_description_1 = require("../utils/content-description");
// Detail fields persisted as JSON in Product.description
const DETAIL_KEYS = ['name', 'price', 'currency', 'shortdes', 'longdes', 'features', 'photos', 'publish'];
async function listProducts(contentId, domainId, page, limit) {
    // Verify content belongs to domain
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
    const [items, countResult] = await Promise.all([
        Product_1.Product.query()
            .where('content_id', contentId)
            .where('status', '!=', 2)
            .orderBy('priority', 'desc')
            .orderBy('id', 'desc')
            .limit(safeLimit)
            .offset(offset)
            .withGraphFetched('author'),
        Product_1.Product.query().where('content_id', contentId).where('status', '!=', 2).count('id as count').first(),
    ]);
    const total = Number(countResult?.count) || 0;
    return { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total) };
}
async function getProduct(productId) {
    const product = await Product_1.Product.query().findById(productId).withGraphFetched('author');
    if (!product || product.status === 2)
        throw new errors_1.NotFoundError('Product not found');
    return product;
}
async function createProduct(contentId, data, userId, domainId) {
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    if (content.content_type !== Content_1.Content.TYPE_PRODUCT) {
        throw new errors_1.BadRequestError('Content is not a product/service catalog');
    }
    await (0, cache_1.invalidateDomainCache)(domainId);
    return Product_1.Product.query().insert({
        content_id: contentId,
        description: (0, content_description_1.stringifyDescription)(data),
        userid: userId,
        status: data.status !== undefined ? data.status : 0,
        priority: data.priority || 0,
        publish_date: data.publish || new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
}
async function updateProduct(productId, data, domainId) {
    const product = await Product_1.Product.query().findById(productId);
    if (!product || product.status === 2)
        throw new errors_1.NotFoundError('Product not found');
    // Verify ownership through the parent content
    const content = await Content_1.Content.query().where('content_id', product.content_id).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    const updateData = {};
    if (Object.keys(data).some(k => DETAIL_KEYS.includes(k))) {
        const existing = product.description ? JSON.parse(product.description) : {};
        updateData.description = JSON.stringify({ ...existing, ...data });
    }
    if (data.status !== undefined)
        updateData.status = data.status;
    if (data.priority !== undefined)
        updateData.priority = data.priority;
    if (data.publish !== undefined)
        updateData.publish_date = data.publish;
    await Product_1.Product.query().patch(updateData).where('id', productId);
    return Product_1.Product.query().findById(productId).withGraphFetched('author');
}
async function deleteProduct(productId, domainId) {
    const product = await Product_1.Product.query().findById(productId);
    if (!product || product.status === 2)
        throw new errors_1.NotFoundError('Product not found');
    const content = await Content_1.Content.query().where('content_id', product.content_id).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await Product_1.Product.query().patch({ status: 2 }).where('id', productId);
}
//# sourceMappingURL=product.service.js.map