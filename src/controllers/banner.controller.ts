import { Request, Response, NextFunction } from 'express';
import { Banner } from '../models/Banner';
import { NotFoundError } from '../utils/errors';
import { invalidateDomainCache } from '../middleware/cache';
import { resolveFileField } from '../utils/upload-helper';

export async function listBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const banners = await Banner.listByDomain(req.user!.domainId);
    res.json({ status: true, data: banners });
  } catch (err) { next(err); }
}

export async function addBanner(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);

    const { key } = await resolveFileField(req.file, req.body.image, 'banner');

    const banner = await Banner.query().insert({
      title: req.body.title,
      description: req.body.description || '',
      image: key,
      domain_id: req.user!.domainId,
      lang_id: parseInt(req.body.lang_id) || 1,
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
