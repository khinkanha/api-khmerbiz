import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../config/s3';
import { config } from '../config/index';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4',
  'application/pdf',
];

function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || 'bin';
}

function generateKey(folder: string, extension: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${folder}/${timestamp}-${random}.${extension}`;
}

export function validateFileType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType);
}

export async function generatePresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: string = 'photos'
): Promise<{ uploadUrl: string; key: string; thumbnailKey: string }> {
  const extension = getFileExtension(fileName);
  const key = generateKey(folder, extension);
  const thumbnailKey = `thubnail/${key}`;

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

  return { uploadUrl, key, thumbnailKey };
}

export async function uploadFileToS3(
  buffer: Buffer,
  fileName: string,
  mimeType: string,
  folder: string = 'uploads'
): Promise<{ key: string; thumbnailKey: string }> {
  const extension = getFileExtension(fileName);
  const key = generateKey(folder, extension);
  const thumbnailKey = `thubnail/${key}`;

  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
    Body: buffer,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  return { key, thumbnailKey };
}

export async function getPresignedGetUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: config.s3.bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function getPublicUrl(key: string): string {
  return `${config.s3.photoBaseUrl}${key}`;
}

// Extensions we treat as image references when rewriting href/src in HTML.
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'];

function isImagePath(value: string): boolean {
  const clean = value.split('?')[0].split('#')[0].toLowerCase();
  return IMAGE_EXTENSIONS.some(ext => clean.endsWith('.' + ext));
}

/**
 * Return `src` unchanged if it is already a full/absolute URL
 * (http://, https://, protocol-relative //, or a data: URI).
 * Otherwise treat it as a relative bucket key and prepend
 * config.s3.photoBaseUrl, avoiding any double-prefix and trimming a
 * leading slash so we never produce `//uploads/...`.
 */
export function resolveImageUrl(src: string): string {
  if (!src || typeof src !== 'string') return src;

  const trimmed = src.trim();
  if (!trimmed) return src;

  // Already absolute or protocol-relative — leave as-is.
  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('//') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed;
  }

  let base = config.s3.photoBaseUrl;
  if (!base.endsWith('/')) base += '/';

  // Strip leading slash(es) so base + key has exactly one separator.
  const relative = trimmed.replace(/^\/+/, '');

  // Avoid double-prefix if the key already starts with the base path.
  if (relative.startsWith(base)) return relative;

  return `${base}${relative}`;
}

/**
 * Rewrite every <img src> (and <a href> that points at an image file)
 * inside an HTML string through resolveImageUrl. Uses jsdom so it is
 * parser-safe rather than a brittle regex. Non-HTML or empty input is
 * returned unchanged.
 */
export function resolveImagesInHtml(html: string): string {
  if (!html || typeof html !== 'string' || !html.includes('<')) return html;

  let document: Document;
  try {
    document = new (require('jsdom').JSDOM)('').window.document;
  } catch {
    // jsdom unavailable — fall back to leaving content untouched.
    return html;
  }

  try {
    const container = document.createElement('div');
    container.innerHTML = html;

    container.querySelectorAll('img[src]').forEach(img => {
      const next = resolveImageUrl(img.getAttribute('src') || '');
      img.setAttribute('src', next);
    });

    container.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href') || '';
      if (isImagePath(href)) {
        a.setAttribute('href', resolveImageUrl(href));
      }
    });

    return container.innerHTML;
  } catch {
    return html;
  }
}
