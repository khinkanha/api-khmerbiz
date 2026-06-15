export declare function validateFileType(mimeType: string): boolean;
export declare function generatePresignedUploadUrl(fileName: string, fileType: string, folder?: string): Promise<{
    uploadUrl: string;
    key: string;
    thumbnailKey: string;
}>;
export declare function uploadFileToS3(buffer: Buffer, fileName: string, mimeType: string, folder?: string): Promise<{
    key: string;
    thumbnailKey: string;
}>;
export declare function getPresignedGetUrl(key: string): Promise<string>;
export declare function getPublicUrl(key: string): string;
/**
 * Return `src` unchanged if it is already a full/absolute URL
 * (http://, https://, protocol-relative //, or a data: URI).
 * Otherwise treat it as a relative bucket key and prepend
 * config.s3.photoBaseUrl, avoiding any double-prefix and trimming a
 * leading slash so we never produce `//uploads/...`.
 */
export declare function resolveImageUrl(src: string): string;
/**
 * Rewrite every <img src> (and <a href> that points at an image file)
 * inside an HTML string through resolveImageUrl. Uses jsdom so it is
 * parser-safe rather than a brittle regex. Non-HTML or empty input is
 * returned unchanged.
 */
export declare function resolveImagesInHtml(html: string): string;
//# sourceMappingURL=s3.d.ts.map