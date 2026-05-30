import { MenuItem } from '../models/MenuItem';
export declare function listMenus(domainId: number, page: number, limit: number): Promise<{
    items: MenuItem[];
    pagination: import("../types/api").PaginationMeta;
}>;
export declare function getMenu(itemId: number, domainId: number): Promise<MenuItem>;
export declare function createMenu(data: Partial<MenuItem>, domainId: number): Promise<MenuItem>;
export declare function updateMenu(itemId: number, data: Partial<MenuItem>, domainId: number): Promise<MenuItem | undefined>;
export declare function deleteMenu(itemId: number, domainId: number): Promise<void>;
export declare function reorderMenu(itemId: number, direction: 'up' | 'down', domainId: number): Promise<void>;
//# sourceMappingURL=menu.service.d.ts.map