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
      .orderBy('tblmenu_item.lang_id', 'asc')
      .orderBy('tblmenu_item.item_order', 'asc')
      .orderBy('tblmenu_item.item_id', 'asc')
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

  // Siblings in the same language, ordered by item_order. Finding the real neighbor
  // (rather than assuming item_order values are contiguous) handles gaps left by deletions
  // and avoids leaving the order number unchanged when no item sits exactly at order ± 1.
  const siblings = await MenuItem.query()
    .where('domain_id', domainId)
    .where('lang_id', item.lang_id)
    .orderBy('item_order', 'asc')
    .orderBy('item_id', 'asc');

  const index = siblings.findIndex((s) => s.item_id === itemId);
  if (index === -1) throw new NotFoundError('Menu item not found');

  const neighborIndex = direction === 'up' ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= siblings.length) {
    throw new NotFoundError(direction === 'up' ? 'Already at the top' : 'Already at the bottom');
  }

  // Build the desired sequence: move the item into the neighbor's slot,
  // then assign sequential item_order (1..n). Persisting only changed rows also
  // repairs any gaps or duplicates in item_order as a side effect.
  const reordered = [...siblings];
  const [moved] = reordered.splice(index, 1);
  reordered.splice(neighborIndex, 0, moved);

  for (let i = 0; i < reordered.length; i++) {
    const newOrder = i + 1;
    if (reordered[i].item_order !== newOrder) {
      await MenuItem.query().patch({ item_order: newOrder }).where('item_id', reordered[i].item_id);
    }
  }

  await invalidateDomainCache(domainId);
  await clearMenuCache(domainId);
}

async function clearMenuCache(domainId: number) {
  const keys = await redis.keys(`cache:${domainId}:menu:*`);
  if (keys.length) await redis.del(...keys);
}
