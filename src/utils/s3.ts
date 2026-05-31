import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';
import { s3Client } from '../config/s3';
import { config } from '../config/index';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4',
  'application/pdf',
];

const THUMBNAIL_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

function isImageType(mimeType: string): boolean {
  return THUMBNAIL_TYPES.includes(mimeType);
}

async function generateThumbnail(buffer: Buffer, mimeType: string): Promise<Buffer> {
  return sharp(buffer)
    .resize({ width: Math.floor((await sharp(buffer).metadata()).width! / 4) })
    .jpeg({ quality: 100 })
    .toBuffer();
}

async function uploadThumbnailToS3(thumbnailKey: string, buffer: Buffer): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: config.s3.bucket,
    Key: thumbnailKey,
    Body: buffer,
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  });
  await s3Client.send(command);
}

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

  // Generate thumbnail for image types
  if (isImageType(mimeType)) {
    try {
      const thumbBuffer = await generateThumbnail(buffer, mimeType);
      await uploadThumbnailToS3(thumbnailKey, thumbBuffer);
    } catch (err) {
      console.error('Thumbnail generation failed:', err);
    }
  }

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
