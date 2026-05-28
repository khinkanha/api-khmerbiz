import { Request, Response, NextFunction } from 'express';
import { Language } from '../models/Language';
import { MenuItem } from '../models/MenuItem';
import { Content } from '../models/Content';
import { Setting } from '../models/Setting';

export async function getSetupStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const domainId = req.user!.domainId;

    const [language, menuCount, contentCount, settings] = await Promise.all([
      Language.query().where('domain_id', domainId).first(),
      MenuItem.query().where('domain_id', domainId).resultSize(),
      Content.query().where('domain_id', domainId).where('status', '!=', 2).resultSize(),
      Setting.getByDomain(domainId),
    ]);

    const menus = menuCount > 0
      ? await MenuItem.query().where('domain_id', domainId).where('parent_id', 0).orderBy('item_order', 'asc')
      : [];

    res.json({
      status: true,
      data: {
        hasLanguage: !!language,
        language,
        hasMenus: menuCount > 0,
        menuCount,
        menus,
        hasContent: contentCount > 0,
        contentCount,
        hasBasicSettings: !!(settings?.title),
        settings: settings ? { title: settings.title, logo: settings.logo } : null,
      },
    });
  } catch (err) { next(err); }
}
