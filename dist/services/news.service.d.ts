import { News } from '../models/News';
export declare function listNews(contentId: number, domainId: number, page: number, limit: number): Promise<{
    items: News[];
    pagination: import("../types/api").PaginationMeta;
}>;
export declare function getNews(newsId: number): Promise<News>;
export declare function createNews(contentId: number, data: {
    title: string;
    shortdes?: string;
    longdes?: string;
    photo?: string;
    publish?: string;
    priority?: number;
    status?: number;
}, userId: number, domainId: number): Promise<News>;
export declare function updateNews(newsId: number, data: Record<string, any>, userId: number, domainId: number): Promise<News | undefined>;
export declare function deleteNews(newsId: number, domainId: number): Promise<void>;
//# sourceMappingURL=news.service.d.ts.map