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
exports.resolveDomain = resolveDomain;
exports.getDomainConfig = getDomainConfig;
exports.clearDomainCache = clearDomainCache;
const Domain_1 = require("../models/Domain");
const redis_1 = require("../config/redis");
async function resolveDomain(hostName) {
    const name = hostName.replace(/^www\./, '').split(':')[0];
    const cacheKey = `cache:domain:${name}`;
    // Check cache
    const cached = await redis_1.redis.get(cacheKey);
    if (cached) {
        return JSON.parse(cached);
    }
    const domain = await Domain_1.Domain.getByName(name);
    if (!domain)
        return null;
    // Cache for 120s
    await redis_1.redis.setex(cacheKey, 120, JSON.stringify(domain));
    return domain;
}
async function getDomainConfig(domainId) {
    const { Setting } = await Promise.resolve().then(() => __importStar(require('../models/Setting')));
    const { Language } = await Promise.resolve().then(() => __importStar(require('../models/Language')));
    const { SocialMedia } = await Promise.resolve().then(() => __importStar(require('../models/SocialMedia')));
    const { Banner } = await Promise.resolve().then(() => __importStar(require('../models/Banner')));
    const [domain, settings, languages, socialMedia, banners] = await Promise.all([
        Domain_1.Domain.query().findById(domainId),
        Setting.getByDomain(domainId),
        Language.listByDomain(domainId),
        SocialMedia.listByDomain(domainId),
        Banner.listByDomain(domainId),
    ]);
    return { domain, settings, languages, socialMedia, banners };
}
async function clearDomainCache(domainId) {
    const keys = await redis_1.redis.keys(`cache:*:${domainId}:*`);
    const siteKeys = await redis_1.redis.keys(`cache:site:${domainId}:*`);
    const allKeys = [...keys, ...siteKeys];
    if (allKeys.length > 0) {
        await redis_1.redis.del(...allKeys);
    }
}
//# sourceMappingURL=domain.service.js.map