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
exports.listMenus = listMenus;
exports.getMenu = getMenu;
exports.createMenu = createMenu;
exports.updateMenu = updateMenu;
exports.deleteMenu = deleteMenu;
exports.reorderMenu = reorderMenu;
exports.clearMenuCache = clearMenuCache;
const menuService = __importStar(require("../services/menu.service"));
const errors_1 = require("../utils/errors");
async function listMenus(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const result = await menuService.listMenus(req.user.domainId, page, limit);
        res.json({ status: true, data: result });
    }
    catch (err) {
        next(err);
    }
}
async function getMenu(req, res, next) {
    try {
        const itemId = parseInt(req.params.itemId);
        const item = await menuService.getMenu(itemId, req.user.domainId);
        res.json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function createMenu(req, res, next) {
    try {
        const item = await menuService.createMenu(req.body, req.user.domainId);
        res.status(201).json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function updateMenu(req, res, next) {
    try {
        const itemId = parseInt(req.params.itemId);
        const item = await menuService.updateMenu(itemId, req.body, req.user.domainId);
        res.json({ status: true, data: item });
    }
    catch (err) {
        next(err);
    }
}
async function deleteMenu(req, res, next) {
    try {
        const itemId = parseInt(req.params.itemId);
        await menuService.deleteMenu(itemId, req.user.domainId);
        res.json({ status: true, message: 'Menu item deleted' });
    }
    catch (err) {
        next(err);
    }
}
async function reorderMenu(req, res, next) {
    try {
        const itemId = parseInt(req.params.itemId);
        await menuService.reorderMenu(itemId, req.body.direction, req.user.domainId);
        res.json({ status: true, message: 'Menu reordered' });
    }
    catch (err) {
        next(err);
    }
}
async function clearMenuCache(req, res, next) {
    try {
        const { invalidateDomainCache } = await Promise.resolve().then(() => __importStar(require('../middleware/cache')));
        // Super admins may clear any tenant's cache — the target domainId is sent
        // in the request body. All other users are restricted to their own domain.
        // (This was the bug: it previously used req.user.domainId, which is 0 for
        // super admins, so the public site's cache:site:{realId}:* keys were never
        // matched and nothing was actually cleared.)
        const isSuperAdmin = req.user.userLevel === -1;
        const requestedDomainId = Number(req.body?.domainId);
        const domainId = isSuperAdmin && Number.isInteger(requestedDomainId) && requestedDomainId > 0
            ? requestedDomainId
            : req.user.domainId;
        if (!Number.isInteger(domainId) || domainId <= 0) {
            return next(new errors_1.BadRequestError('A valid domainId is required to clear cache'));
        }
        await invalidateDomainCache(domainId);
        res.json({ status: true, message: 'Cache cleared', data: { domainId } });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=menu.controller.js.map