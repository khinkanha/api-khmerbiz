"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listNews = listNews;
exports.getNews = getNews;
exports.createNews = createNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;
const News_1 = require("../models/News");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const cache_1 = require("../middleware/cache");
const content_description_1 = require("../utils/content-description");
const Content_1 = require("../models/Content");
async function listNews(contentId, domainId, page, limit) {
    // Verify content belongs to domain
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
    const [items, countResult] = await Promise.all([
        News_1.News.query()
            .where('content_id', contentId)
            .where('status', '!=', 2)
            .orderBy('publish_date', 'desc')
            .limit(safeLimit)
            .offset(offset)
            .withGraphFetched('author'),
        News_1.News.query().where('content_id', contentId).where('status', '!=', 2).count('id as count').first(),
    ]);
    const total = Number(countResult?.count) || 0;
    return { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total) };
}
async function getNews(newsId) {
    const news = await News_1.News.query().findById(newsId).withGraphFetched('author');
    if (!news || news.status === 2)
        throw new errors_1.NotFoundError('News not found');
    return news;
}
async function createNews(contentId, data, userId, domainId) {
    const content = await Content_1.Content.query().where('content_id', contentId).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    console.log('news server from client side', data);
    await (0, cache_1.invalidateDomainCache)(domainId);
    return News_1.News.query().insert({
        content_id: contentId,
        description: (0, content_description_1.stringifyDescription)(data),
        userid: userId,
        status: data.status !== undefined ? data.status : 0,
        priority: data.priority || 0,
        publish_date: data.publish || new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
}
async function updateNews(newsId, data, userId, domainId) {
    const news = await News_1.News.query().findById(newsId);
    if (!news || news.status === 2)
        throw new errors_1.NotFoundError('News not found');
    // Verify content belongs to domain
    const content = await Content_1.Content.query().where('content_id', news.content_id).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    const updateData = {};
    if (Object.keys(data).some(k => ['title', 'shortdes', 'longdes', 'photo', 'publish'].includes(k))) {
        const existing = news.description ? JSON.parse(news.description) : {};
        updateData.description = JSON.stringify({ ...existing, ...data });
    }
    if (data.status !== undefined)
        updateData.status = data.status;
    if (data.priority !== undefined)
        updateData.priority = data.priority;
    if (data.publish !== undefined)
        updateData.publish_date = data.publish;
    await News_1.News.query().patch(updateData).where('id', newsId);
    return News_1.News.query().findById(newsId).withGraphFetched('author');
}
async function deleteNews(newsId, domainId) {
    const news = await News_1.News.query().findById(newsId);
    if (!news || news.status === 2)
        throw new errors_1.NotFoundError('News not found');
    const content = await Content_1.Content.query().where('content_id', news.content_id).where('domain_id', domainId).first();
    if (!content)
        throw new errors_1.NotFoundError('Content not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await News_1.News.query().patch({ status: 2 }).where('id', newsId);
}
//# sourceMappingURL=news.service.js.map