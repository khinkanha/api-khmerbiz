import { Request, Response, NextFunction } from 'express';
import { Domain } from '../models/Domain';
import { redis } from '../config/redis';
import { NotFoundError } from '../utils/errors';

export async function domainScope(req: Request, _res: Response, next: NextFunction) {
  try {
    const host = req.headers['x-forwarded-host'] as string || req.hostname || req.headers.host || '';
    const domainName = host.replace(/^www\./, '').split(':')[0];

    if (!domainName) {
      return next();
    }

    // Check Redis cache first (if Redis is available)
    if (redis) {
      try {
        const cacheKey = `cache:domain:${domainName}`;
        const cached = await redis.get(cacheKey);

        if (cached) {
          const domainData = JSON.parse(cached);
          req.domain = domainData;
          return next();
        }
      } catch (redisErr) {
        // Redis error, continue to database lookup
        console.warn('Redis cache error, falling back to database:', redisErr);
      }
    }

    // Look up in database
    const domain = await Domain.getByName(domainName);
    if (!domain) {
      return next(); // Don't block — let route handler decide
    }

    // Cache for 120 seconds (if Redis is available)
    if (redis) {
      try {
        const cacheKey = `cache:domain:${domainName}`;
        await redis.setex(cacheKey, 120, JSON.stringify(domain));
      } catch (cacheErr) {
        // Ignore caching errors
        console.warn('Failed to cache domain data:', cacheErr);
      }
    }

    req.domain = domain;
    next();
  } catch (err) {
    next(err);
  }
}
