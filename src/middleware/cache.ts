import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { config } from '../config';
import { Domain } from '../models/Domain';

export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (config.isDev) return next();
    if (req.method !== 'GET') return next();

    // Resolve the domain id the SAME way the route handlers do, so the cache
    // key lives in the namespace that invalidateDomainCache(domainId) clears.
    // Browser requests pass domain_id as a query param / route param (useApi
    // does not forward X-Forwarded-Host), so req.domain is often unset here —
    // previously those responses were cached under a 'public' namespace that
    // clear-cache never matched, so stale data survived.
    const domainId =
      req.domain?.domain_id
      || parseInt(req.query.domain_id as string)
      || parseInt((req.params as Record<string, string>)?.domainId as string)
      || 0;
    if (!domainId) return next(); // no domain to cache against — serve fresh

    const cacheKey = `cache:site:${domainId}:${req.originalUrl}`;

    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        return res.json(parsed);
      }

      // Intercept res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode === 200 && body.status === true) {
          redis.setex(cacheKey, ttl, JSON.stringify(body)).catch(console.error);
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
}

export async function invalidateDomainCache(domainId: number): Promise<void> {
  try {
    // Cached public-site responses, written by cacheMiddleware as:
    //   cache:site:{domainId}:{originalUrl}
    const siteKeys = await redis.keys(`cache:site:${domainId}:*`);
    if (siteKeys.length > 0) {
      await redis.del(...siteKeys);
    }

    // Transitional cleanup: responses cached under the old 'public' namespace
    // (written before cacheMiddleware resolved domain_id from the query/path).
    // Drain them so a clear takes effect immediately instead of waiting on TTL.
    const publicKeys = await redis.keys(`cache:site:public:*`);
    if (publicKeys.length > 0) {
      await redis.del(...publicKeys);
    }

    // The domain-scope middleware caches the resolved domain under its name;
    // drop it so the next request re-resolves the domain from the database.
    const domain = await Domain.query().findById(domainId);
    if (domain?.domain_name) {
      await redis.del(`cache:domain:${domain.domain_name}`);
    }
  } catch (err) {
    console.error('Cache invalidation error:', err);
  }
}
