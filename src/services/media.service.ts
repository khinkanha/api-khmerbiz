import { Media } from '../models/Media';
import { generatePresignedUploadUrl, validateFileType, getPublicUrl } from '../utils/s3';
import { config } from '../config/index';
import { getPagination, buildPaginationMeta } from '../utils/pagination';
import { BadRequestError, ForbiddenError, ConflictError } from '../utils/errors';
import crypto from 'crypto';

export async function listMedia(domainId: number, page: number, limit: number, search?: string) {
  const { offset, limit: safeLimit } = getPagination(page, limit);
  let query = Media.query().where('domain_id', domainId);

  if (search) {
    query = query.where('title', 'like', `%${search}%`);
  }

  const [items, countResult] = await Promise.all([
    query.orderBy('photo_id', 'desc').limit(safeLimit).offset(offset),
    Media.countByDomain(domainId),
  ]);

  return { items, pagination: buildPaginationMeta(page, safeLimit, countResult) };
}

export async function requestUploadUrl(fileName: string, fileType: string, folder: string, domainId: number) {
  if (!validateFileType(fileType)) {
    throw new BadRequestError('File type not allowed');
  }

  // Check domain file limit
  const count = await Media.countByDomain(domainId);
  if (count >= config.upload.maxFilesPerDomain) {
    throw new ForbiddenError(`File limit reached (${config.upload.maxFilesPerDomain} files)`);
  }

  const { uploadUrl, key, thumbnailKey } = await generatePresignedUploadUrl(fileName, fileType, folder);
  return { uploadUrl, key, thumbnailKey };
}

export async function confirmUpload(key: string, originalName: string, title: string | undefined, domainId: number, userId: number) {
  const code = crypto.createHash('md5').update(key).digest('hex');

  // Check for duplicate
  const exists = await Media.isExist(code, domainId);
  if (exists) {
    throw new ConflictError('File already exists');
  }

  const media = await Media.query().insert({
    file_name: key,
    domain_id: domainId,
    code,
    title: title || originalName,
    server_id: 1,
  });

  return media;
}

export function getMediaUrl(key: string): string {
  return getPublicUrl(key);
}
