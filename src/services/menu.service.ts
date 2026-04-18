import { MenuItem } from '../models/MenuItem';
import { NotFoundError } from '../utils/errors';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { invalidateDomainCache } from '../middleware/cache';
import { redis } from '../config/redis';

export async function listMenus(domainId: number, page: number, limit: number) {
  const { offset, limit: safeLimit } = getPagination(page, limit);

  const [items, countResult] = await Promise.all([
    MenuItem.query()
      .select('tblmenu_item.*',
        MenuItem.raw('parent_menu.item_name as parent_name'),
        MenuItem.raw('tblcontent.content_id'),
        MenuItem.raw('tblcontent.title'),
        MenuItem.raw('tblcontent.content_type')
      )
      .leftJoin('tblmenu_item as parent_menu', 'tblmenu_item.parent_id', 'parent_menu.item_id')
      .leftJoin('tblcontent', 'tblmenu_item.item_id', 'tblcontent.menu_id')
      .where('tblmenu_item.domain_id', domainId)
      .orderBy('tblmenu_item.item_id', 'desc')
      .limit(safeLimit)
      .offset(offset),
    MenuItem.query().where('domain_id', domainId).count('item_id as count').first(),
  ]);

  const total = Number((countResult as any)?.count) || 0;
  return { items, pagination: buildPaginationMeta(page, safeLimit, total) };
}

export async function getMenu(itemId: number, domainId: number) {
  const item = await MenuItem.query()
    .select('tblmenu_item.*',
      MenuItem.raw('tblcontent.content_id'),
      MenuItem.raw('tblcontent.title'),
      MenuItem.raw('tblcontent.content_type')
    )
    .leftJoin('tblcontent', 'tblmenu_item.item_id', 'tblcontent.menu_id')
    .where('tblmenu_item.item_id', itemId)
    .where('tblmenu_item.domain_id', domainId)
    .first();

  if (!item) throw new NotFoundError('Menu item not found');
  return item;
}

export async function createMenu(data: Partial<MenuItem>, domainId: number) {
  const maxOrder = await MenuItem.getMaxOrder(data.lang_id || 0);
  await invalidateDomainCache(domainId);
  await clearMenuCache(domainId);
  return MenuItem.query().insert({
    ...data,
    domain_id: domainId,
    item_order: data.item_order || maxOrder + 1,
  });
}

export async function updateMenu(itemId: number, data: Partial<MenuItem>, domainId: number) {
  const item = await MenuItem.query().where('item_id', itemId).where('domain_id', domainId).first();
  if (!item) throw new NotFoundError('Menu item not found');

  await invalidateDomainCache(domainId);
  await clearMenuCache(domainId);
  await MenuItem.query().patch(data).where('item_id', itemId);
  return MenuItem.query().findById(itemId);
}

export async function deleteMenu(itemId: number, domainId: number) {
  const item = await MenuItem.query().where('item_id', itemId).where('domain_id', domainId).first();
  if (!item) throw new NotFoundError('Menu item not found');

  await invalidateDomainCache(domainId);
  await clearMenuCache(domainId);
  await MenuItem.query().deleteById(itemId);
}

export async function reorderMenu(itemId: number, direction: 'up' | 'down', domainId: number) {
  const item = await MenuItem.query().where('item_id', itemId).where('domain_id', domainId).first();
  if (!item) throw new NotFoundError('Menu item not found');

  const newOrder = direction === 'up' ? item.item_order - 1 : item.item_order + 1;
  if (newOrder < 1) throw new NotFoundError('Already at the top');

  // Swap with the item at the target order position
  const targetItem = await MenuItem.query()
    .where('item_order', newOrder)
    .where('lang_id', item.lang_id)
    .first();

  if (!targetItem) throw new NotFoundError('Cannot reorder in that direction');

  // Swap orders
  await MenuItem.query().patch({ item_order: item.item_order }).where('item_id', targetItem.item_id);
  await MenuItem.query().patch({ item_order: newOrder }).where('item_id', itemId);

  await invalidateDomainCache(domainId);
  await clearMenuCache(domainId);
}

async function clearMenuCache(domainId: number) {
  const keys = await redis.keys(`cache:${domainId}:menu:*`);
  if (keys.length) await redis.del(...keys);
}
