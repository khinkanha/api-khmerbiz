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
            .orderBy('tblmenu_item.item_id', 'desc')
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
    const newOrder = direction === 'up' ? item.item_order - 1 : item.item_order + 1;
    if (newOrder < 1)
        throw new errors_1.NotFoundError('Already at the top');
    // Swap with the item at the target order position
    const targetItem = await MenuItem_1.MenuItem.query()
        .where('item_order', newOrder)
        .where('lang_id', item.lang_id)
        .first();
    if (!targetItem)
        throw new errors_1.NotFoundError('Cannot reorder in that direction');
    // Swap orders
    await MenuItem_1.MenuItem.query().patch({ item_order: item.item_order }).where('item_id', targetItem.item_id);
    await MenuItem_1.MenuItem.query().patch({ item_order: newOrder }).where('item_id', itemId);
    await (0, cache_1.invalidateDomainCache)(domainId);
    await clearMenuCache(domainId);
}
async function clearMenuCache(domainId) {
    const keys = await redis_1.redis.keys(`cache:${domainId}:menu:*`);
    if (keys.length)
        await redis_1.redis.del(...keys);
}
//# sourceMappingURL=menu.service.js.map