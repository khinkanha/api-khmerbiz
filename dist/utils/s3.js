"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileType = validateFileType;
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.getPresignedGetUrl = getPresignedGetUrl;
exports.getPublicUrl = getPublicUrl;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const s3_1 = require("../config/s3");
const index_1 = require("../config/index");
const ALLOWED_TYPES = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4',
    'application/pdf',
];
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