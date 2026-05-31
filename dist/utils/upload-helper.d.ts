interface ResolveFileFieldOptions {
    recordInPhotos?: boolean;
    domainId?: number;
    title?: string;
}
interface ResolveFileFieldResult {
    key: string | undefined;
    url: string | undefined;
}
/**
 * Resolve a file field: if a file was uploaded, upload it to S3.
 * Optionally create a record in tblphotos.
 * Returns both the S3 key and the full public URL.
 */
export declare function resolveFileField(file: Express.Multer.File | undefined, fallbackString: string | undefined, folder: string, options?: ResolveFileFieldOptions): Promise<ResolveFileFieldResult>;
export {};
//# sourceMappingURL=upload-helper.d.ts.map