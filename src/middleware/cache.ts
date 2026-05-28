import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis';
import { config } from '../config';
import { Domain } from '../models/Domain';

export function cacheMiddleware(ttl: number = 300) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (config.isDev) return next();
    if (req.method !== 'GET') return next();

    const domainId = req.domain?.domain_id || 'public';
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
  const pattern = `cache:site:${domainId}:*`;
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    // Also invalidate specific caches
    await redis.del(
      `cache:${domainId}:menu:*`,
      `cache:${domainId}:settings`,
      `cache:${domainId}:languages`,
      `cache:${domainId}:banners`
    );
    // Clear domain scope cache (domain-scope middleware caches by domain name)
    const domain = await Domain.query().findById(domainId);
    if (domain?.domain_name) {
      await redis.del(`cache:domain:${domain.domain_name}`);
    }
  } catch (err) {
    console.error('Cache invalidation error:', err);
  }
}
