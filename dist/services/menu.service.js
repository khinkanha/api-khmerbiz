"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMenus = listMenus;
exports.getMenu = getMenu;
exports.createMenu = createMenu;
exports.updateMenu = updateMenu;
exports.deleteMenu = deleteMenu;
exports.reorderMenu = reorderMenu;
const MenuItem_1 = require("../models/MenuItem");
const errors_1 = require("../utils/errors");
const pagination_1 = require("../utils/pagination");
const cache_1 = require("../middleware/cache");
const redis_1 = require("../config/redis");
async function listMenus(domainId, page, limit) {
    const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
    const [items, countResult] = await Promise.all([
        MenuItem_1.MenuItem.query()
            .select('tblmenu_item.*', MenuItem_1.MenuItem.raw('parent_menu.item_name as parent_name'), MenuItem_1.MenuItem.raw('tblcontent.content_id'), MenuItem_1.MenuItem.raw('tblcontent.title'), MenuItem_1.MenuItem.raw('tblcontent.content_type'))
            .leftJoin('tblmenu_item as parent_menu', 'tblmenu_item.parent_id', 'parent_menu.item_id')
            .leftJoin('tblcontent', 'tblmenu_item.item_id', 'tblcontent.menu_id')
            .where('tblmenu_item.domain_id', domainId)
            .orderBy('tblmenu_item.lang_id', 'asc')
            .orderBy('tblmenu_item.item_order', 'asc')
            .orderBy('tblmenu_item.item_id', 'asc')
            .limit(safeLimit)
            .offset(offset),
        MenuItem_1.MenuItem.query().where('domain_id', domainId).count('item_id as count').first(),
    ]);
    const total = Number(countResult?.count) || 0;
    return { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, total) };
}
async function getMenu(itemId, domainId) {
    const item = await MenuItem_1.MenuItem.query()
        .select('tblmenu_item.*', MenuItem_1.MenuItem.raw('tblcontent.content_id'), MenuItem_1.MenuItem.raw('tblcontent.title'), MenuItem_1.MenuItem.raw('tblcontent.content_type'))
        .leftJoin('tblcontent', 'tblmenu_item.item_id', 'tblcontent.menu_id')
        .where('tblmenu_item.item_id', itemId)
        .where('tblmenu_item.domain_id', domainId)
        .first();
    if (!item)
        throw new errors_1.NotFoundError('Menu item not found');
    return item;
}
async function createMenu(data, domainId) {
    const maxOrder = await MenuItem_1.MenuItem.getMaxOrder(data.lang_id || 0);
    await (0, cache_1.invalidateDomainCache)(domainId);
    await clearMenuCache(domainId);
    return MenuItem_1.MenuItem.query().insert({
        ...data,
        domain_id: domainId,
        item_order: data.item_order || maxOrder + 1,
    });
}
async function updateMenu(itemId, data, domainId) {
    const item = await MenuItem_1.MenuItem.query().where('item_id', itemId).where('domain_id', domainId).first();
    if (!item)
        throw new errors_1.NotFoundError('Menu item not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await clearMenuCache(domainId);
    await MenuItem_1.MenuItem.query().patch(data).where('item_id', itemId);
    return MenuItem_1.MenuItem.query().findById(itemId);
}
async function deleteMenu(itemId, domainId) {
    const item = await MenuItem_1.MenuItem.query().where('item_id', itemId).where('domain_id', domainId).first();
    if (!item)
        throw new errors_1.NotFoundError('Menu item not found');
    await (0, cache_1.invalidateDomainCache)(domainId);
    await clearMenuCache(domainId);
    await MenuItem_1.MenuItem.query().deleteById(itemId);
}
async function reorderMenu(itemId, direction, domainId) {
    const item = await MenuItem_1.MenuItem.query().where('item_id', itemId).where('domain_id', domainId).first();
    if (!item)
        throw new errors_1.NotFoundError('Menu item not found');
    // Siblings in the same language, ordered by item_order. Finding the real neighbor
    // (rather than assuming item_order values are contiguous) handles gaps left by deletions
    // and avoids leaving the order number unchanged when no item sits exactly at order ± 1.
    const siblings = await MenuItem_1.MenuItem.query()
        .where('domain_id', domainId)
        .where('lang_id', item.lang_id)
        .orderBy('item_order', 'asc')
        .orderBy('item_id', 'asc');
    const index = siblings.findIndex((s) => s.item_id === itemId);
    if (index === -1)
        throw new errors_1.NotFoundError('Menu item not found');
    const neighborIndex = direction === 'up' ? index - 1 : index + 1;
    if (neighborIndex < 0 || neighborIndex >= siblings.length) {
        throw new errors_1.NotFoundError(direction === 'up' ? 'Already at the top' : 'Already at the bottom');
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
            await MenuItem_1.MenuItem.query().patch({ item_order: newOrder }).where('item_id', reordered[i].item_id);
        }
    }
    await (0, cache_1.invalidateDomainCache)(domainId);
    await clearMenuCache(domainId);
}
async function clearMenuCache(domainId) {
    const keys = await redis_1.redis.keys(`cache:${domainId}:menu:*`);
    if (keys.length)
        await redis_1.redis.del(...keys);
}
//# sourceMappingURL=menu.service.js.map