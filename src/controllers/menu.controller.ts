import { Request, Response, NextFunction } from 'express';
import * as menuService from '../services/menu.service';

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
    await invalidateDomainCache(req.user!.domainId);
    res.json({ status: true, message: 'Cache cleared' });
  } catch (err) { next(err); }
}
