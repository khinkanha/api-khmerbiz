import { Content } from '../models/Content';
import { ContentItem } from '../models/ContentItem';
export declare function listContent(domainId: number, page: number, limit: number, search?: string, contentType?: number): Promise<{
    items: Content[];
    pagination: import("../types/api").PaginationMeta;
}>;
export declare function getContent(contentId: number, domainId: number): Promise<Content>;
export declare function createContent(data: Partial<Content>, userId: number, domainId: number): Promise<Content>;
export declare function updateContent(contentId: number, data: Partial<Content>, domainId: number): Promise<Content | undefined>;
export declare function deleteContent(contentId: number, domainId: number): Promise<void>;
export declare function listItems(contentId: number, domainId: number): Promise<ContentItem[]>;
export declare function createItem(contentId: number, data: Partial<ContentItem>, userId: number, domainId: number): Promise<ContentItem>;
export declare function updateItem(itemId: number, data: Partial<ContentItem>, domainId: number): Promise<ContentItem | undefined>;
export declare function deleteItem(itemId: number, domainId: number): Promise<void>;
export declare function updateMap(contentId: number, data: {
    title: string;
    description?: string;
    lat: number;
    lng: number;
    visible: number;
}, domainId: number): Promise<void>;
//# sourceMappingURL=content.service.d.ts.map