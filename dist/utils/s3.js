"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileType = validateFileType;
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.uploadFileToS3 = uploadFileToS3;
exports.getPresignedGetUrl = getPresignedGetUrl;
exports.getPublicUrl = getPublicUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const sharp_1 = __importDefault(require("sharp"));
const s3_1 = require("../config/s3");
const index_1 = require("../config/index");
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4',
    'application/pdf',
];
const THUMBNAIL_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
function isImageType(mimeType) {
    return THUMBNAIL_TYPES.includes(mimeType);
}
async function generateThumbnail(buffer, mimeType) {
    return (0, sharp_1.default)(buffer)
        .resize({ width: Math.floor((await (0, sharp_1.default)(buffer).metadata()).width / 4) })
        .jpeg({ quality: 100 })
        .toBuffer();
}
async function uploadThumbnailToS3(thumbnailKey, buffer) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: index_1.config.s3.bucket,
        Key: thumbnailKey,
        Body: buffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',
    });
    await s3_1.s3Client.send(command);
}
function getFileExtension(fileName) {
    return fileName.split('.').pop()?.toLowerCase() || 'bin';
}
function generateKey(folder, extension) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${folder}/${timestamp}-${random}.${extension}`;
}
function validateFileType(mimeType) {
    return ALLOWED_TYPES.includes(mimeType);
}
async function generatePresignedUploadUrl(fileName, fileType, folder = 'photos') {
    const extension = getFileExtension(fileName);
    const key = generateKey(folder, extension);
    const thumbnailKey = `thubnail/${key}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: index_1.config.s3.bucket,
        Key: key,
        ContentType: fileType,
    });
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3Client, command, { expiresIn: 3600 });
    return { uploadUrl, key, thumbnailKey };
}
async function uploadFileToS3(buffer, fileName, mimeType, folder = 'uploads') {
    const extension = getFileExtension(fileName);
    const key = generateKey(folder, extension);
    const thumbnailKey = `thubnail/${key}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: index_1.config.s3.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ACL: 'public-read',
    });
    await s3_1.s3Client.send(command);
    // Generate thumbnail for image types
    if (isImageType(mimeType)) {
        try {
            const thumbBuffer = await generateThumbnail(buffer, mimeType);
            await uploadThumbnailToS3(thumbnailKey, thumbBuffer);
        }
        catch (err) {
            console.error('Thumbnail generation failed:', err);
        }
    }
    return { key, thumbnailKey };
}
async function getPresignedGetUrl(key) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: index_1.config.s3.bucket,
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(s3_1.s3Client, command, { expiresIn: 3600 });
}
function getPublicUrl(key) {
    return `${index_1.config.s3.photoBaseUrl}${key}`;
}
//# sourceMappingURL=s3.js.map