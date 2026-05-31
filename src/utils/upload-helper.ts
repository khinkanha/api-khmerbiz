import crypto from 'crypto';
import { uploadFileToS3, getPublicUrl } from './s3';
import { Media } from '../models/Media';

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
export async function resolveFileField(
  file: Express.Multer.File | undefined,
  fallbackString: string | undefined,
  folder: string,
  options?: ResolveFileFieldOptions,
): Promise<ResolveFileFieldResult> {
  if (file) {
    const { key } = await uploadFileToS3(file.buffer, file.originalname, file.mimetype, folder);

    if (options?.recordInPhotos && options.domainId) {
      const code = crypto.createHash('md5').update(key).digest('hex');

      const exists = await Media.isExist(code, options.domainId);
      if (!exists) {
        await Media.query().insert({
          file_name: key,
          domain_id: options.domainId,
          code,
          title: options.title || null,
          server_id: 1,
        });
      }
    }

    return { key, url: getPublicUrl(key) };
  }

  if (fallbackString) {
    return { key: fallbackString, url: getPublicUrl(fallbackString) };
  }

  return { key: undefined, url: undefined };
}
