import { uploadFileToS3 } from './s3';

/**
 * Resolve a file field: if a file was uploaded, upload it to S3 and return the key.
 * Otherwise fall back to the string value from the request body.
 */
export async function resolveFileField(
  file: Express.Multer.File | undefined,
  fallbackString: string | undefined,
  folder: string,
): Promise<string | undefined> {
  if (file) {
    const { key } = await uploadFileToS3(file.buffer, file.originalname, file.mimetype, folder);
    return key;
  }
  return fallbackString;
}
