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
//# sourceMappingURL=s3.d.ts.map