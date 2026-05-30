"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainScope = domainScope;
const Domain_1 = require("../models/Domain");
const redis_1 = require("../config/redis");
async function domainScope(req, _res, next) {
    try {
        const host = req.headers['x-forwarded-host'] || req.hostname || req.headers.host || '';
        const domainName = host.replace(/^www\./, '').split(':')[0];
        if (!domainName) {
            return next();
        }
        // Check Redis cache first (if Redis is available)
        if (redis_1.redis) {
            try {
                const cacheKey = `cache:domain:${domainName}`;
                const cached = await redis_1.redis.get(cacheKey);
                if (cached) {
                    const domainData = JSON.parse(cached);
                    req.domain = domainData;
                    return next();
                }
            }
            catch (redisErr) {
                // Redis error, continue to database lookup
                console.warn('Redis cache error, falling back to database:', redisErr);
            }
        }
        // Look up in database
        const domain = await Domain_1.Domain.getByName(domainName);
        if (!domain) {
            return next(); // Don't block — let route handler decide
        }
        // Cache for 120 seconds (if Redis is available)
        if (redis_1.redis) {
            try {
                const cacheKey = `cache:domain:${domainName}`;
                await redis_1.redis.setex(cacheKey, 120, JSON.stringify(domain));
            }
            catch (cacheErr) {
                // Ignore caching errors
                console.warn('Failed to cache domain data:', cacheErr);
            }
        }
        req.domain = domain;
        next();
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=domain-scope.js.map