"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listContent = listContent;
exports.getContent = getContent;
exports.createContent = createContent;
exports.updateContent = updateContent;
exports.deleteContent = deleteContent;
exports.listItems = listItems;
exports.createItem = createItem;
exports.updateItem = updateItem;
exports.deleteItem = deleteItem;
exports.updateMap = updateMap;
const Content_1 = require("../models/Content");
const ContentItem_1 = require("../models/ContentItem");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const cache_1 = require("../middleware/cache");
async function listContent(domainId, page, limit, search, contentType) {
    const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
    let query = Content_1.Content.query()
        .where('domain_id', domainId)
        .where('status', '!=', 2);
    if (search) {
        query = query.where('title', 'like', `%${search}%`);
    }
    if (contentType !== undefined && contentType !== null && !Number.isNaN(contentType)) {
        query = query.where('content_type', contentType);
    }
    const [items, countResult] = await Promise.all([
        query.orderBy('content_id', 'desc').limit(safeLimit).offset(offset),
        Content_1.Content.query()
            .where('domain_id', domainId)
            .where('status', '!=', 2)
            .modify((qb) => {
            if (search)
                qb.where('title', 'like', `%${search}%`);
            if (contentType !== undefined && contentType !== null && !Number.isNaN(contentType)) {
                qb.where('content_type', contentType);
            }
        })
            .count('content_id as count')
            .first(),
    ]);
    const total = Number(countResult?.count) || 0;
    return { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total) };
}
async function getContent(contentId, domainId) {
    const content = await Content_1.Content.query()
        .where('content_id', contentId)
        .where('domain_id', domainId)
        .where('status', '!=', 2)
        .withGraphFetched('[items, newsItems]')
        .first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    return content;
}
async function createContent(data, userId, domainId) {
    await (0, cache_1.invalidateDomainCache)(domainId);
    const description = JSON.stringify({
        title: data.title || '',
        description: data.description || '',
    });
    const content = await Content_1.Content.query().insert({
        ...data,
        description,
        domain_id: domainId,
        userid: userId,
        status: 0,
    });
    return content;
}
async function updateContent(contentId, data, domainId) {
    const content = await Content_1.Content.query()
        .where('content_id', contentId)
        .where('domain_id', domainId)
        .where('status', '!=', 2)
        .first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    if (data.description !== undefined) {
        data.description = JSON.stringify({
            title: data.title || content.title || '',
            description: data.description,
        });
    }
    await Content_1.Content.query().patch(data).where('content_id', contentId);
    return Content_1.Content.query().findById(contentId);
}
async function deleteContent(contentId, domainId) {
    const content = await Content_1.Content.query()
        .where('content_id', contentId)
        .where('domain_id', domainId)
        .first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await Content_1.Content.query().patch({ menu_id: 0, status: 2 }).where('content_id', contentId);
}
// Content Items
async function listItems(contentId, domainId) {
    // Verify content belongs to domain
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    return ContentItem_1.ContentItem.query()
        .where('content_id', contentId)
        .where('status', '!=', 2);
}
async function createItem(contentId, data, userId, domainId) {
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    return ContentItem_1.ContentItem.query().insert({
        ...data,
        content_id: contentId,
        upload_by: userId,
        status: 0,
    });
}
async function updateItem(itemId, data, domainId) {
    const item = await ContentItem_1.ContentItem.query().findById(itemId);
    if (!item)
        throw new errors_1.NotFoundError('Item not found');
    // Verify ownership through content
    const content = await Content_1.Content.query().where('content_id', item.content_id).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await ContentItem_1.ContentItem.query().patch(data).where('item_id', itemId);
    return ContentItem_1.ContentItem.query().findById(itemId);
}
async function deleteItem(itemId, domainId) {
    const item = await ContentItem_1.ContentItem.query().findById(itemId);
    if (!item)
        throw new errors_1.NotFoundError('Item not found');
    const content = await Content_1.Content.query().where('content_id', item.content_id).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await ContentItem_1.ContentItem.query().patch({ status: 2 }).where('item_id', itemId);
}
// Map
async function updateMap(contentId, data, domainId) {
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    if (content.content_type !== Content_1.Content.TYPE_MAP)
        throw new errors_1.BadRequestError('Content is not a map type');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await Content_1.Content.query().patch({
        description: JSON.stringify(data),
    }).where('content_id', contentId);
}
//# sourceMappingURL=content.service.js.map