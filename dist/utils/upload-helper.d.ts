/**
 * Resolve a file field: if a file was uploaded, upload it to S3 and return the key.
 * Otherwise fall back to the string value from the request body.
 */
export declare function resolveFileField(file: Express.Multer.File | undefined, fallbackString: string | undefined, folder: string): Promise<string | undefined>;
//# sourceMappingURL=upload-helper.d.ts.map