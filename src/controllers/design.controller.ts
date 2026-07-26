import { Request, Response, NextFunction } from 'express';
import { SiteDesign } from '../models/SiteDesign';
import { invalidateDomainCache } from '../middleware/cache';

/**
 * GET /admin/design — return the authenticated user's published SiteDesign
 * as a parsed object. Responds with `data: null` when no design exists yet
 * (the frontend then seeds from the current theme client-side).
 */
export async function getDesign(req: Request, res: Response, next: NextFunction) {
  try {
    const design = await SiteDesign.getPublishedConfig(req.user!.domainId);
    res.json({ status: true, data: design });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /admin/design — upsert the authenticated user's published SiteDesign.
 * Body is the full design object; it is stored as a JSON string. The domain_id
 * is taken from the authenticated user (authoritative), not the request body.
 */
export async function saveDesign(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.user!.domainId;
    const json = JSON.stringify(req.body);

    const existing = await SiteDesign.getPublishedByDomain(domainId);
    if (existing) {
      await SiteDesign.query()
        .patch({ design: json })
        .where('site_design_id', existing.site_design_id);
    } else {
      await SiteDesign.query().insert({
        domain_id: domainId,
        design: json,
        status: 1,
      });
    }

    // Public /site/config is cached; clear it so the new design is visible.
    await invalidateDomainCache(domainId);

    res.json({ status: true, data: req.body });
  } catch (err) {
    next(err);
  }
}
