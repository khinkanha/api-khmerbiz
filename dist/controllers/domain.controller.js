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
exports.listDomains = listDomains;
exports.getDomain = getDomain;
exports.createDomain = createDomain;
exports.registerDomain = registerDomain;
exports.updateDomain = updateDomain;
exports.updateDomainStatus = updateDomainStatus;
exports.clearDomainCacheController = clearDomainCacheController;
const Domain_1 = require("../models/Domain");
const Setting_1 = require("../models/Setting");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const domain_service_1 = require("../services/domain.service");
async function listDomains(req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
        const [items, countResult] = await Promise.all([
            Domain_1.Domain.query().orderBy('domain_id', 'desc').limit(safeLimit).offset(offset),
            Domain_1.Domain.query().count('domain_id as count').first(),
        ]);
        const total = Number(countResult?.count) || 0;
        res.json({ status: true, data: { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total) } });
    }
    catch (err) {
        next(err);
    }
}
async function getDomain(req, res, next) {
    try {
        const domainId = parseInt(req.params.domainId);
        const domain = await Domain_1.Domain.query().findById(domainId);
        if (!domain)
            throw new errors_1.NotFoundError('Domain not found');
        res.json({ status: true, data: domain });
    }
    catch (err) {
        next(err);
    }
}
async function createDomain(req, res, next) {
    try {
        const existing = await Domain_1.Domain.getByName(req.body.domain_name);
        if (existing)
            throw new errors_1.NotFoundError('Domain already exists');
        const domain = await Domain_1.Domain.query().insert({
            domain_name: req.body.domain_name,
            company_name: req.body.company_name || '',
            company_address: req.body.company_address || '',
            phone_number: req.body.phone_number || '',
            email: req.body.email || '',
            company_desc: req.body.company_desc || '',
            status: Domain_1.Domain.ACTIVE,
        });
        // Auto-create settings for the new domain
        await Setting_1.Setting.query().insert({
            domain_id: domain.domain_id,
            domain_name: req.body.domain_name,
            logo: '',
            mobile_logo: '',
            page_style: 0,
            theme: 0,
            banner_display: 0,
            footer_align: 0,
        });
        res.status(201).json({ status: true, data: domain });
    }
    catch (err) {
        next(err);
    }
}
async function registerDomain(req, res, next) {
    try {
        const existing = await Domain_1.Domain.getByName(req.body.domain_name);
        if (existing)
            throw new errors_1.NotFoundError('Domain already exists');
        const domain = await Domain_1.Domain.query().insert({
            domain_name: req.body.domain_name,
            company_name: req.body.company_name || '',
            company_address: req.body.company_address || '',
            phone_number: req.body.phone_number || '',
            email: req.body.email || '',
            company_desc: req.body.company_desc || '',
            status: Domain_1.Domain.ACTIVE,
        });
        // Create settings for the domain
        await Setting_1.Setting.query().insert({
            domain_id: domain.domain_id,
            domain_name: req.body.domain_name,
            logo: '',
            mobile_logo: '',
            page_style: 0,
            theme: 0,
            banner_display: 0,
            footer_align: 0,
        });
        // Assign domain to user
        const { User } = await Promise.resolve().then(() => __importStar(require('../models/User')));
        await User.query().patch({ domain_id: domain.domain_id, user_level: 1 }).where('userid', req.user.userId);
        res.status(201).json({ status: true, data: domain });
    }
    catch (err) {
        next(err);
    }
}
async function updateDomain(req, res, next) {
    try {
        const domainId = parseInt(req.params.domainId);
        await Domain_1.Domain.query().patch(req.body).where('domain_id', domainId);
        await (0, domain_service_1.clearDomainCache)(domainId);
        const domain = await Domain_1.Domain.query().findById(domainId);
        res.json({ status: true, data: domain });
    }
    catch (err) {
        next(err);
    }
}
async function updateDomainStatus(req, res, next) {
    try {
        const domainId = parseInt(req.params.domainId);
        await Domain_1.Domain.query().patch({ status: req.body.status }).where('domain_id', domainId);
        await (0, domain_service_1.clearDomainCache)(domainId);
        res.json({ status: true, message: 'Status updated' });
    }
    catch (err) {
        next(err);
    }
}
async function clearDomainCacheController(req, res, next) {
    try {
        const domainId = parseInt(req.params.domainId);
        await (0, domain_service_1.clearDomainCache)(domainId);
        const domain = await Domain_1.Domain.query().findById(domainId);
        if (domain)
            await domain.clearCache();
        res.json({ status: true, message: 'Cache cleared' });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=domain.controller.js.map