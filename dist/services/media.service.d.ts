import { Media } from '../models/Media';
export declare function listMedia(domainId: number, page: number, limit: number, search?: string): Promise<{
    items: Media[];
    pagination: import("../types/api").PaginationMeta;
}>;
export declare function requestUploadUrl(fileName: string, fileType: string, folder: string, domainId: number): Promise<{
    uploadUrl: string;
    key: string;
    thumbnailKey: string;
}>;
export declare function confirmUpload(key: string, originalName: string, title: string | undefined, domainId: number, userId: number): Promise<Media>;
export declare function getMediaUrl(key: string): string;
//# sourceMappingURL=media.service.d.ts.map