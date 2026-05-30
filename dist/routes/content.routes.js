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
const express_1 = require("express");
const ctrl = __importStar(require("../controllers/content.controller"));
const auth_1 = require("../middleware/auth");
const validate_1 = require("../middleware/validate");
const content_schema_1 = require("../validators/content.schema");
const news_schema_1 = require("../validators/news.schema");
const rate_limiter_1 = require("../middleware/rate-limiter");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, auth_1.requireAuth);
// Content CRUD
router.get('/', rate_limiter_1.apiLimiter, ctrl.listContent);
router.post('/', (0, validate_1.validate)(content_schema_1.createContentSchema), ctrl.createContent);
router.get('/:contentId', (0, validate_1.validate)(content_schema_1.contentIdParamSchema), ctrl.getContent);
router.put('/:contentId', (0, validate_1.validate)(content_schema_1.updateContentSchema), ctrl.updateContent);
router.delete('/:contentId', (0, validate_1.validate)(content_schema_1.contentIdParamSchema), ctrl.deleteContent);
// Content Items
router.get('/:contentId/items', (0, validate_1.validate)(content_schema_1.contentIdParamSchema), ctrl.listItems);
router.post('/:contentId/items', (0, validate_1.validate)(content_schema_1.createItemSchema), ctrl.createItem);
router.put('/:contentId/items/:itemId', (0, validate_1.validate)(content_schema_1.updateItemSchema), ctrl.updateItem);
router.delete('/:contentId/items/:itemId', ctrl.deleteItem);
// Map
router.put('/:contentId/map', (0, validate_1.validate)(content_schema_1.mapSchema), ctrl.updateMap);
// News
router.get('/:contentId/news', (0, validate_1.validate)(content_schema_1.contentIdParamSchema), ctrl.listNews);
router.post('/:contentId/news', (0, validate_1.validate)(news_schema_1.createNewsSchema), ctrl.createNews);
router.get('/:contentId/news/:newsId', ctrl.getNews);
router.put('/:contentId/news/:newsId', (0, validate_1.validate)(news_schema_1.updateNewsSchema), ctrl.updateNews);
router.delete('/:contentId/news/:newsId', ctrl.deleteNews);
exports.default = router;
//# sourceMappingURL=content.routes.js.map