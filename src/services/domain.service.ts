import { Domain } from '../models/Domain';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { redis } from '../config/redis';

export async function resolveDomain(hostName: string): Promise<Domain | null> {
  const name = hostName.replace(/^www\./, '').split(':')[0];
  const cacheKey = `cache:domain:${name}`;

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const domain = await Domain.getByName(name);
  if (!domain) return null;

  // Cache for 120s
  await redis.setex(cacheKey, 120, JSON.stringify(domain));
  return domain;
}

export async function getDomainConfig(domainId: number) {
  const { Setting } = await import('../models/Setting');
  const { Language } = await import('../models/Language');
  const { SocialMedia } = await import('../models/SocialMedia');
  const { Banner } = await import('../models/Banner');

  const [domain, settings, languages, socialMedia, banners] = await Promise.all([
    Domain.query().findById(domainId),
    Setting.getByDomain(domainId),
    Language.listByDomain(domainId),
    SocialMedia.listByDomain(domainId),
    Banner.listByDomain(domainId),
  ]);

  return { domain, settings, languages, socialMedia, banners };
}

export async function clearDomainCache(domainId: number) {
  const keys = await redis.keys(`cache:*:${domainId}:*`);
  const siteKeys = await redis.keys(`cache:site:${domainId}:*`);
  const allKeys = [...keys, ...siteKeys];
  if (allKeys.length > 0) {
    await redis.del(...allKeys);
  }
}
