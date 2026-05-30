"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.listNews = listNews;
exports.getNews = getNews;
exports.createNews = createNews;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;
const contentService = __importStar(require("../services/content.service"));
const newsService = __importStar(require("../services/news.service"));
// Content
async function listContent(req, res, next) {
    try {
        const domainId = req.user.domainId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search;
        const result = await contentService.listContent(domainId, page, limit, search);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getContent(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const content = await contentService.getContent(contentId, req.user.domainId);
        res.json({ status: true, data: content });
    }
    catch (err) {
        next(err);
    }
}
async function createContent(req, res, next) {
    try {
        const content = await contentService.createContent(req.body, req.user.userId, req.user.domainId);
        res.status(201).json({ status: true, data: content });
    }
    catch (err) {
        next(err);
    }
}
async function updateContent(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const content = await contentService.updateContent(contentId, req.body, req.user.domainId);
        res.json({ status: true, data: content });
    }
    catch (err) {
        next(err);
    }
}
async function deleteContent(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        await contentService.deleteContent(contentId, req.user.domainId);
        res.json({ status: true, message: 'Content deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Content Items
async function listItems(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const items = await contentService.listItems(contentId, req.user.domainId);
        res.json({ status: true, data: items });
    }
    catch (err) {
        next(err);
    }
}
async function createItem(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const item = await contentService.createItem(contentId, req.body, req.user.userId, req.user.domainId);
        res.status(201).json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function updateItem(req, res, next) {
    try {
        const itemId = parseInt(req.params.itemId);
        const item = await contentService.updateItem(itemId, req.body, req.user.domainId);
        res.json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function deleteItem(req, res, next) {
    try {
        const itemId = parseInt(req.params.itemId);
        await contentService.deleteItem(itemId, req.user.domainId);
        res.json({ status: true, message: 'Item deleted' });
    }
    catch (err) {
        next(err);
    }
}
// Map
async function updateMap(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        await contentService.updateMap(contentId, req.body, req.user.domainId);
        res.json({ status: true, message: 'Map updated' });
    }
    catch (err) {
        next(err);
    }
}
// News
async function listNews(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await newsService.listNews(contentId, req.user.domainId, page, limit);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getNews(req, res, next) {
    try {
        const newsId = parseInt(req.params.newsId);
        const news = await newsService.getNews(newsId);
        res.json({ status: true, data: news });
    }
    catch (err) {
        next(err);
    }
}
async function createNews(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const news = await newsService.createNews(contentId, req.body, req.user.userId, req.user.domainId);
        res.status(201).json({ status: true, data: news });
    }
    catch (err) {
        next(err);
    }
}
async function updateNews(req, res, next) {
    try {
        const newsId = parseInt(req.params.newsId);
        const news = await newsService.updateNews(newsId, req.body, req.user.userId, req.user.domainId);
        res.json({ status: true, data: news });
    }
    catch (err) {
        next(err);
    }
}
async function deleteNews(req, res, next) {
    try {
        const newsId = parseInt(req.params.newsId);
        await newsService.deleteNews(newsId, req.user.domainId);
        res.json({ status: true, message: 'News deleted' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=content.controller.js.map