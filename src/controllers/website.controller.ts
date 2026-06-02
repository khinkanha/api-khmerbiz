import { Request, Response, NextFunction } from 'express';
import { Domain } from '../models/Domain';
import { Content } from '../models/Content';
import { News } from '../models/News';
import { MenuItem } from '../models/MenuItem';
import { Banner } from '../models/Banner';
import { Setting } from '../models/Setting';
import { Language } from '../models/Language';
import { SocialMedia } from '../models/SocialMedia';
import { cacheMiddleware } from '../middleware/cache';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { getDomainConfig } from '../services/domain.service';

export async function getSiteConfig(req: Request, res: Response, next: NextFunction) {
  try {
    let domainId = req.domain?.domain_id || parseInt(req.query.domain_id as string) || 0;

    // Also resolve by domain_name query param (used by client-side when SSR fails)
    if (!domainId && req.query.domain_name) {
      const domain = await Domain.getByName(req.query.domain_name as string);
      if (domain) domainId = domain.domain_id;
    }

    if (!domainId) throw new NotFoundError('Domain not found');

    const config = await getDomainConfig(domainId);
    res.json({ status: true, data: config });
  } catch (err) { next(err); }
}

export async function getSiteMenu(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.domain?.domain_id || parseInt(req.query.domain_id as string) || 0;
    if (!domainId) throw new NotFoundError('Domain not found');

    const queryLangId = parseInt(req.query.lang_id as string) || 0;
    const langId = queryLangId || await Language.getDefault(domainId).then(l => l?.lang_id || 0);

    const menuItems = await MenuItem.getMenuTree(domainId, langId);
    res.json({ status: true, data: menuItems });
  } catch (err) { next(err); }
}

export async function getSiteHome(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.domain?.domain_id || parseInt(req.query.domain_id as string) || 0;
    if (!domainId) throw new NotFoundError('Domain not found');

    const defaultLang = await Language.getDefault(domainId);
    const langId = defaultLang?.lang_id || 0;

    // Get all root menus (no parent)
    const rootMenus = await MenuItem.query()
      .where('domain_id', domainId)
      .where('lang_id', langId)
      .where('parent_id', 0)
      .orderBy('item_order', 'asc');

    if (!rootMenus.length) {
      return res.json({ status: true, data: [] });
    }

    // Get all content for these menus
    const menuIds = rootMenus.map(m => m.item_id);
    const contents = await Content.query()
      .whereIn('menu_id', menuIds)
      .where('status', '!=', 2)
      .withGraphFetched('[items, newsItems]');

    // Map content to menu
    const contentMap = new Map(contents.map(c => [c.menu_id, c]));
    const sections = rootMenus.map(menu => ({
      menu,
      content: contentMap.get(menu.item_id) || null,
    }));

    res.json({ status: true, data: sections });
  } catch (err) { next(err); }
}

export async function getSitePage(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = parseInt(req.params.domainId);
    const menuItemId = parseInt(req.params.menuItemId);

    const content = await Content.query()
      .where('menu_id', menuItemId)
      .where('domain_id', domainId)
      .where('status', '!=', 2)
      .withGraphFetched('items')
      .first();

    if (!content) throw new NotFoundError('Page not found');
    res.json({ status: true, data: content });
  } catch (err) { next(err); }
}

export async function getSiteNews(req: Request, res: Response, next: NextFunction) {
  try {
    const newsId = parseInt(req.params.newsId);
    const news = await News.query()
      .findById(newsId)
      .withGraphFetched('author');

    if (!news || news.status === 2) throw new NotFoundError('News not found');
    res.json({ status: true, data: news });
  } catch (err) { next(err); }
}

export async function getSiteArticle(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const content = await Content.query()
      .where('content_id', contentId)
      .where('status', '!=', 2)
      .withGraphFetched('items')
      .first();

    if (!content) throw new NotFoundError('Article not found');
    res.json({ status: true, data: content });
  } catch (err) { next(err); }
}

export async function getSiteBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.domain?.domain_id || parseInt(req.query.domain_id as string) || 0;
    if (!domainId) throw new NotFoundError('Domain not found');

    const banners = await Banner.listByDomain(domainId);
    res.json({ status: true, data: banners });
  } catch (err) { next(err); }
}

export async function getSiteDefault(req: Request, res: Response, next: NextFunction) {
  try {
    const domainName = req.query.domain_name as string;

    if (!domainName) {
      throw new NotFoundError('Domain not found');
    }

    const domain = await Domain.getByName(domainName);
    if (!domain) {
      throw new NotFoundError('Domain not found');
    }

    const config = await getDomainConfig(domain.domain_id);
    res.json({ status: true, data: config });
  } catch (err) { next(err); }
}

export async function getFeatureNews(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const news = await News.query()
      .where('content_id', contentId)
      .where('priority', 1)
      .where('status', '!=', 2)
      .withGraphFetched('author')
      .orderBy('id', 'desc');

    res.json({ status: true, data: news });
  } catch (err) { next(err); }
}

export async function getListNews(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { offset, limit: safeLimit } = getPagination(page, limit);

    // Verify content exists and is not deleted
    const content = await Content.query()
      .where('content_id', contentId)
      .where('status', '!=', 2)
      .first();
    if (!content) {
      res.json({ status: true, data: { items: [], pagination: buildPaginationMeta(page, safeLimit, 0) } });
      return;
    }

    const [items, countResult] = await Promise.all([
      News.query()
        .where('content_id', contentId)
        .where('status', '!=', 2)
        .withGraphFetched('author')
        .orderBy('priority', 'desc')
        .orderBy('publish_date', 'desc')
        .limit(safeLimit)
        .offset(offset),
      News.query()
        .where('content_id', contentId)
        .where('status', '!=', 2)
        .count('id as count')
        .first(),
    ]);

    const total = Number((countResult as any)?.count) || 0;
    res.json({
      status: true,
      data: {
        items,
        pagination: buildPaginationMeta(page, safeLimit, total),
      },
    });
  } catch (err) { next(err); }
}
