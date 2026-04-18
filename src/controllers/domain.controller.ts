import { Request, Response, NextFunction } from 'express';
import { Domain } from '../models/Domain';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { clearDomainCache } from '../services/domain.service';

export async function listDomains(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const { offset, limit: safeLimit } = getPagination(page, limit);

    const [items, countResult] = await Promise.all([
      Domain.query().orderBy('domain_id', 'desc').limit(safeLimit).offset(offset),
      Domain.query().count('domain_id as count').first(),
    ]);

    const total = (countResult?.count as number) || 0;
    res.json({ status: true, data: { items, pagination: buildPaginationMeta(page, safeLimit, total) } });
  } catch (err) { next(err); }
}

export async function getDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = parseInt(req.params.domainId);
    const domain = await Domain.query().findById(domainId);
    if (!domain) throw new NotFoundError('Domain not found');
    res.json({ status: true, data: domain });
  } catch (err) { next(err); }
}

export async function createDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await Domain.getByName(req.body.domain_name);
    if (existing) throw new NotFoundError('Domain already exists');

    const domain = await Domain.query().insert(req.body);
    res.status(201).json({ status: true, data: domain });
  } catch (err) { next(err); }
}

export async function registerDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const existing = await Domain.getByName(req.body.domain_name);
    if (existing) throw new NotFoundError('Domain already exists');

    const domain = await Domain.query().insert({
      domain_name: req.body.domain_name,
      company_name: req.body.company_name || '',
      company_address: req.body.company_address || '',
      phone_number: req.body.phone_number || '',
      email: req.body.email || '',
      company_desc: req.body.company_desc || '',
      status: Domain.ACTIVE,
    });

    // Create settings for the domain
    const { Setting } = await import('../models/Setting');
    await Setting.query().insert({
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
    const { User } = await import('../models/User');
    await User.query().patch({ domain_id: domain.domain_id, user_level: 1 }).where('userid', req.user!.userId);

    res.status(201).json({ status: true, data: domain });
  } catch (err) { next(err); }
}

export async function updateDomain(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = parseInt(req.params.domainId);
    await Domain.query().patch(req.body).where('domain_id', domainId);
    await clearDomainCache(domainId);
    const domain = await Domain.query().findById(domainId);
    res.json({ status: true, data: domain });
  } catch (err) { next(err); }
}

export async function updateDomainStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = parseInt(req.params.domainId);
    await Domain.query().patch({ status: req.body.status }).where('domain_id', domainId);
    await clearDomainCache(domainId);
    res.json({ status: true, message: 'Status updated' });
  } catch (err) { next(err); }
}

export async function clearDomainCacheController(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = parseInt(req.params.domainId);
    await clearDomainCache(domainId);
    const domain = await Domain.query().findById(domainId);
    if (domain) await domain.clearCache();
    res.json({ status: true, message: 'Cache cleared' });
  } catch (err) { next(err); }
}
