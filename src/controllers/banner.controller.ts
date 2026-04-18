import { Request, Response, NextFunction } from 'express';
import { Banner } from '../models/Banner';
import { NotFoundError } from '../utils/errors';
import { invalidateDomainCache } from '../middleware/cache';

export async function listBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const banners = await Banner.listByDomain(req.user!.domainId);
    res.json({ status: true, data: banners });
  } catch (err) { next(err); }
}

export async function addBanner(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);
    const banner = await Banner.query().insert({
      ...req.body,
      domain_id: req.user!.domainId,
    });
    res.status(201).json({ status: true, data: banner });
  } catch (err) { next(err); }
}

export async function deleteBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const bannerId = parseInt(req.params.bannerId);
    const banner = await Banner.query().findById(bannerId);
    if (!banner || banner.domain_id !== req.user!.domainId) {
      throw new NotFoundError('Banner not found');
    }
    await Banner.query().deleteById(bannerId);
    await invalidateDomainCache(req.user!.domainId);
    res.json({ status: true, message: 'Banner deleted' });
  } catch (err) { next(err); }
}
