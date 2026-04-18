import { Request, Response, NextFunction } from 'express';
import { Domain } from '../models/Domain';
import { redis } from '../config/redis';
import { NotFoundError } from '../utils/errors';

export async function domainScope(req: Request, _res: Response, next: NextFunction) {
  try {
    const host = req.hostname || req.headers.host || '';
    const domainName = host.replace(/^www\./, '').split(':')[0];

    if (!domainName) {
      return next();
    }

    // Check Redis cache first
    const cacheKey = `cache:domain:${domainName}`;
    const cached = await redis.get(cacheKey);

    if (cached) {
      const domainData = JSON.parse(cached);
      req.domain = domainData;
      return next();
    }

    // Look up in database
    const domain = await Domain.getByName(domainName);
    if (!domain) {
      return next(); // Don't block — let route handler decide
    }

    // Cache for 120 seconds
    await redis.setex(cacheKey, 120, JSON.stringify(domain));
    req.domain = domain;
    next();
  } catch (err) {
    next(err);
  }
}
