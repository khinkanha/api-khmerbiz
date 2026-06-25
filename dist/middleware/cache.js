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
        // Resolve the domain id the SAME way the route handlers do, so the cache
        // key lives in the namespace that invalidateDomainCache(domainId) clears.
        // Browser requests pass domain_id as a query param / route param (useApi
        // does not forward X-Forwarded-Host), so req.domain is often unset here —
        // previously those responses were cached under a 'public' namespace that
        // clear-cache never matched, so stale data survived.
        const domainId = req.domain?.domain_id
            || parseInt(req.query.domain_id)
            || parseInt(req.params?.domainId)
            || 0;
        if (!domainId)
            return next(); // no domain to cache against — serve fresh
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
    try {
        // Cached public-site responses, written by cacheMiddleware as:
        //   cache:site:{domainId}:{originalUrl}
        const siteKeys = await redis_1.redis.keys(`cache:site:${domainId}:*`);
        if (siteKeys.length > 0) {
            await redis_1.redis.del(...siteKeys);
        }
        // Transitional cleanup: responses cached under the old 'public' namespace
        // (written before cacheMiddleware resolved domain_id from the query/path).
        // Drain them so a clear takes effect immediately instead of waiting on TTL.
        const publicKeys = await redis_1.redis.keys(`cache:site:public:*`);
        if (publicKeys.length > 0) {
            await redis_1.redis.del(...publicKeys);
        }
        // The domain-scope middleware caches the resolved domain under its name;
        // drop it so the next request re-resolves the domain from the database.
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