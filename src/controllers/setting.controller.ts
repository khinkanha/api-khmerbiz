import { Request, Response, NextFunction } from 'express';
import { Setting } from '../models/Setting';
import { Banner } from '../models/Banner';
import { SocialMedia } from '../models/SocialMedia';
import { Language } from '../models/Language';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { invalidateDomainCache } from '../middleware/cache';

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await Setting.getByDomain(req.user!.domainId);
    if (!settings) throw new NotFoundError('Settings not found');
    res.json({ status: true, data: settings });
  } catch (err) { next(err); }
}

export async function updateGeneral(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);
    await Setting.query().patch(req.body).where('domain_id', req.user!.domainId);
    const settings = await Setting.getByDomain(req.user!.domainId);
    res.json({ status: true, data: settings });
  } catch (err) { next(err); }
}

export async function updateMenuSetting(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);
    await Setting.query().patch(req.body).where('domain_id', req.user!.domainId);
    res.json({ status: true, message: 'Menu settings updated' });
  } catch (err) { next(err); }
}

export async function updateBannerSetting(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);
    await Setting.query().patch(req.body).where('domain_id', req.user!.domainId);
    res.json({ status: true, message: 'Banner settings updated' });
  } catch (err) { next(err); }
}

export async function updateLogo(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);
    await Setting.query().patch(req.body).where('domain_id', req.user!.domainId);
    res.json({ status: true, message: 'Logo updated' });
  } catch (err) { next(err); }
}

// Social Media
export async function listSocialMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await SocialMedia.listByDomain(req.user!.domainId);
    res.json({ status: true, data: items });
  } catch (err) { next(err); }
}

export async function addSocialMedia(req: Request, res: Response, next: NextFunction) {
  try {
    await invalidateDomainCache(req.user!.domainId);
    const item = await SocialMedia.query().insert({
      ...req.body,
      domain_id: req.user!.domainId,
    });
    res.status(201).json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function deleteSocialMedia(req: Request, res: Response, next: NextFunction) {
  try {
    const smid = parseInt(req.params.smid);
    await SocialMedia.query().deleteById(smid);
    await invalidateDomainCache(req.user!.domainId);
    res.json({ status: true, message: 'Social media link deleted' });
  } catch (err) { next(err); }
}

// Languages
export async function listLanguages(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await Language.listByDomain(req.user!.domainId);
    res.json({ status: true, data: items });
  } catch (err) { next(err); }
}

export async function addLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    const count = await Language.countByDomain(req.user!.domainId);
    if (count >= 5) throw new BadRequestError('Maximum 5 languages allowed');

    // Check if flag already exists for this domain
    const existing = await Language.query()
      .where('flag', req.body.flag)
      .where('domain_id', req.user!.domainId)
      .first();
    if (existing) throw new BadRequestError('Language flag already exists');

    await invalidateDomainCache(req.user!.domainId);
    const item = await Language.query().insert({
      ...req.body,
      domain_id: req.user!.domainId,
    });
    res.status(201).json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function deleteLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    const langId = parseInt(req.params.langId);
    await Language.query().deleteById(langId);
    await invalidateDomainCache(req.user!.domainId);
    res.json({ status: true, message: 'Language deleted' });
  } catch (err) { next(err); }
}

export async function setDefaultLanguage(req: Request, res: Response, next: NextFunction) {
  try {
    const langId = parseInt(req.params.langId);
    // Reset all defaults for this domain
    await Language.query().patch({ is_default: 0 }).where('domain_id', req.user!.domainId);
    // Set new default
    await Language.query().patch({ is_default: 1 }).where('lang_id', langId);
    await invalidateDomainCache(req.user!.domainId);
    res.json({ status: true, message: 'Default language set' });
  } catch (err) { next(err); }
}
