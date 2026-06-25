import { Request, Response, NextFunction } from 'express';
import * as menuService from '../services/menu.service';
import { BadRequestError } from '../utils/errors';

export async function listMenus(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const result = await menuService.listMenus(req.user!.domainId, page, limit);
    res.json({ status: true, data: result });
  } catch (err) { next(err); }
}

export async function getMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    const item = await menuService.getMenu(itemId, req.user!.domainId);
    res.json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function createMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const item = await menuService.createMenu(req.body, req.user!.domainId);
    res.status(201).json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function updateMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    const item = await menuService.updateMenu(itemId, req.body, req.user!.domainId);
    res.json({ status: true, data: item });
  } catch (err) { next(err); }
}

export async function deleteMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    await menuService.deleteMenu(itemId, req.user!.domainId);
    res.json({ status: true, message: 'Menu item deleted' });
  } catch (err) { next(err); }
}

export async function reorderMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const itemId = parseInt(req.params.itemId);
    await menuService.reorderMenu(itemId, req.body.direction, req.user!.domainId);
    res.json({ status: true, message: 'Menu reordered' });
  } catch (err) { next(err); }
}

export async function clearMenuCache(req: Request, res: Response, next: NextFunction) {
  try {
    const { invalidateDomainCache } = await import('../middleware/cache');

    // Super admins may clear any tenant's cache — the target domainId is sent
    // in the request body. All other users are restricted to their own domain.
    // (This was the bug: it previously used req.user.domainId, which is 0 for
    // super admins, so the public site's cache:site:{realId}:* keys were never
    // matched and nothing was actually cleared.)
    const isSuperAdmin = req.user!.userLevel === -1;
    const requestedDomainId = Number(req.body?.domainId);
    const domainId =
      isSuperAdmin && Number.isInteger(requestedDomainId) && requestedDomainId > 0
        ? requestedDomainId
        : req.user!.domainId;

    if (!Number.isInteger(domainId) || domainId <= 0) {
      return next(new BadRequestError('A valid domainId is required to clear cache'));
    }

    await invalidateDomainCache(domainId);
    res.json({ status: true, message: 'Cache cleared', data: { domainId } });
  } catch (err) { next(err); }
}
