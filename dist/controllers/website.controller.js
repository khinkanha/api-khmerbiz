"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSiteConfig = getSiteConfig;
exports.getSiteMenu = getSiteMenu;
exports.getSiteHome = getSiteHome;
exports.getSitePage = getSitePage;
exports.getSiteNews = getSiteNews;
exports.getSiteArticle = getSiteArticle;
exports.getSiteBanners = getSiteBanners;
exports.getSiteDefault = getSiteDefault;
exports.getFeatureNews = getFeatureNews;
exports.getListNews = getListNews;
const Domain_1 = require("../models/Domain");
const Content_1 = require("../models/Content");
const News_1 = require("../models/News");
const MenuItem_1 = require("../models/MenuItem");
const Banner_1 = require("../models/Banner");
const Language_1 = require("../models/Language");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const domain_service_1 = require("../services/domain.service");
async function getSiteConfig(req, res, next) {
    try {
        let domainId = req.domain?.domain_id || parseInt(req.query.domain_id) || 0;
        // Also resolve by domain_name query param (used by client-side when SSR fails)
        if (!domainId && req.query.domain_name) {
            const domain = await Domain_1.Domain.getByName(req.query.domain_name);
            if (domain)
                domainId = domain.domain_id;
        }
        if (!domainId)
            throw new errors_1.NotFoundError('Domain not found');
        const config = await (0, domain_service_1.getDomainConfig)(domainId);
        res.json({ status: true, data: config });
    }
    catch (err) {
        next(err);
    }
}
async function getSiteMenu(req, res, next) {
    try {
        const domainId = req.domain?.domain_id || parseInt(req.query.domain_id) || 0;
        if (!domainId)
            throw new errors_1.NotFoundError('Domain not found');
        const queryLangId = parseInt(req.query.lang_id) || 0;
        const langId = queryLangId || await Language_1.Language.getDefault(domainId).then(l => l?.lang_id || 0);
        const menuItems = await MenuItem_1.MenuItem.getMenuTree(domainId, langId);
        res.json({ status: true, data: menuItems });
    }
    catch (err) {
        next(err);
    }
}
async function getSiteHome(req, res, next) {
    try {
        const domainId = req.domain?.domain_id || parseInt(req.query.domain_id) || 0;
        if (!domainId)
            throw new errors_1.NotFoundError('Domain not found');
        const defaultLang = await Language_1.Language.getDefault(domainId);
        const langId = defaultLang?.lang_id || 0;
        // Get all root menus (no parent)
        const rootMenus = await MenuItem_1.MenuItem.query()
            .where('domain_id', domainId)
            .where('lang_id', langId)
            .where('parent_id', 0)
            .orderBy('item_order', 'asc');
        if (!rootMenus.length) {
            return res.json({ status: true, data: [] });
        }
        // Get all content for these menus
        const menuIds = rootMenus.map(m => m.item_id);
        const contents = await Content_1.Content.query()
            .whereIn('menu_id', menuIds)
            .where('status', '!=', 2)
            .withGraphFetched('[items, newsItems]')
            .modifyGraph('items', builder => builder.where('status', '!=', 2));
        // Map content to menu
        const contentMap = new Map(contents.map(c => [c.menu_id, c]));
        const sections = rootMenus.map(menu => ({
            menu,
            content: contentMap.get(menu.item_id) || null,
        }));
        res.json({ status: true, data: sections });
    }
    catch (err) {
        next(err);
    }
}
async function getSitePage(req, res, next) {
    try {
        const domainId = parseInt(req.params.domainId);
        const menuItemId = parseInt(req.params.menuItemId);
        const content = await Content_1.Content.query()
            .where('menu_id', menuItemId)
            .where('domain_id', domainId)
            .whereNotIn('status', [1, 2])
            .withGraphFetched('items')
            .modifyGraph('items', builder => builder.whereNotIn('status', [1, 2]))
            .first();
        if (!content)
            throw new errors_1.NotFoundError('Page not found');
        res.json({ status: true, data: content });
    }
    catch (err) {
        next(err);
    }
}
async function getSiteNews(req, res, next) {
    try {
        const newsId = parseInt(req.params.newsId);
        const news = await News_1.News.query()
            .findById(newsId)
            .withGraphFetched('author');
        if (!news || news.status === 2)
            throw new errors_1.NotFoundError('News not found');
        res.json({ status: true, data: news });
    }
    catch (err) {
        next(err);
    }
}
async function getSiteArticle(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const content = await Content_1.Content.query()
            .where('content_id', contentId)
            .whereNotIn('status', [1, 2])
            .withGraphFetched('items')
            .modifyGraph('items', builder => builder.whereNotIn('status', [1, 2]))
            .first();
        if (!content)
            throw new errors_1.NotFoundError('Article not found');
        res.json({ status: true, data: content });
    }
    catch (err) {
        next(err);
    }
}
async function getSiteBanners(req, res, next) {
    try {
        const domainId = req.domain?.domain_id || parseInt(req.query.domain_id) || 0;
        if (!domainId)
            throw new errors_1.NotFoundError('Domain not found');
        const banners = await Banner_1.Banner.listByDomain(domainId);
        res.json({ status: true, data: banners });
    }
    catch (err) {
        next(err);
    }
}
async function getSiteDefault(req, res, next) {
    try {
        const domainName = req.query.domain_name;
        if (!domainName) {
            throw new errors_1.NotFoundError('Domain not found');
        }
        const domain = await Domain_1.Domain.getByName(domainName);
        if (!domain) {
            throw new errors_1.NotFoundError('Domain not found');
        }
        const config = await (0, domain_service_1.getDomainConfig)(domain.domain_id);
        res.json({ status: true, data: config });
    }
    catch (err) {
        next(err);
    }
}
async function getFeatureNews(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const news = await News_1.News.query()
            .where('content_id', contentId)
            .where('priority', 1)
            .whereNotIn('status', [1, 2])
            .withGraphFetched('author')
            .orderBy('id', 'desc');
        res.json({ status: true, data: news });
    }
    catch (err) {
        next(err);
    }
}
async function getListNews(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
        // Verify content exists and is not deleted
        const content = await Content_1.Content.query()
            .where('content_id', contentId)
            .whereNotIn('status', [1, 2])
            .first();
        if (!content) {
            res.json({ status: true, data: { items: [], pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, 0) } });
            return;
        }
        const [items, countResult] = await Promise.all([
            News_1.News.query()
                .where('content_id', contentId)
                .whereNotIn('status', [1, 2])
                .withGraphFetched('author')
                .orderBy('priority', 'desc')
                .orderBy('publish_date', 'desc')
                .limit(safeLimit)
                .offset(offset),
            News_1.News.query()
                .where('content_id', contentId)
                .whereNotIn('status', [1, 2])
                .count('id as count')
                .first(),
        ]);
        const total = Number(countResult?.count) || 0;
        res.json({
            status: true,
            data: {
                items,
                pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total),
            },
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=website.controller.js.map