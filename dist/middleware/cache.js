"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheMiddleware = cacheMiddleware;
exports.invalidateDomainCache = invalidateDomainCache;
const redis_1 = require("../config/redis");
const config_1 = require("../config");
const Domain_1 = require("../models/Domain");
function cacheMiddleware(ttl = 300) {
    return async (req, res, next) => {
        if (config_1.config.isDev)
            return next();
        if (req.method !== 'GET')
            return next();
        const domainId = req.domain?.domain_id || 'public';
        const cacheKey = `cache:site:${domainId}:${req.originalUrl}`;
        try {
            const cached = await redis_1.redis.get(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                return res.json(parsed);
            }
            // Intercept res.json to cache the response
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                if (res.statusCode === 200 && body.status === true) {
                    redis_1.redis.setex(cacheKey, ttl, JSON.stringify(body)).catch(console.error);
                }
                return originalJson(body);
            };
            next();
        }
        catch (err) {
            next();
        }
    };
}
async function invalidateDomainCache(domainId) {
    const pattern = `cache:site:${domainId}:*`;
    try {
        const keys = await redis_1.redis.keys(pattern);
        if (keys.length > 0) {
            await redis_1.redis.del(...keys);
        }
        // Also invalidate specific caches
        await redis_1.redis.del(`cache:${domainId}:menu:*`, `cache:${domainId}:settings`, `cache:${domainId}:languages`, `cache:${domainId}:banners`);
        // Clear domain scope cache (domain-scope middleware caches by domain name)
        const domain = await Domain_1.Domain.query().findById(domainId);
        if (domain?.domain_name) {
            await redis_1.redis.del(`cache:domain:${domain.domain_name}`);
        }
    }
    catch (err) {
        console.error('Cache invalidation error:', err);
    }
}
//# sourceMappingURL=cache.js.map