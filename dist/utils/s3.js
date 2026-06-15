"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileType = validateFileType;
exports.generatePresignedUploadUrl = generatePresignedUploadUrl;
exports.uploadFileToS3 = uploadFileToS3;
exports.getPresignedGetUrl = getPresignedGetUrl;
exports.getPublicUrl = getPublicUrl;
exports.resolveImageUrl = resolveImageUrl;
exports.resolveImagesInHtml = resolveImagesInHtml;
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
// Extensions we treat as image references when rewriting href/src in HTML.
const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'];
function isImagePath(value) {
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
function resolveImageUrl(src) {
    if (!src || typeof src !== 'string')
        return src;
    const trimmed = src.trim();
    if (!trimmed)
        return src;
    // Already absolute or protocol-relative — leave as-is.
    if (trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('//') ||
        trimmed.startsWith('data:')) {
        return trimmed;
    }
    let base = index_1.config.s3.photoBaseUrl;
    if (!base.endsWith('/'))
        base += '/';
    // Strip leading slash(es) so base + key has exactly one separator.
    const relative = trimmed.replace(/^\/+/, '');
    // Avoid double-prefix if the key already starts with the base path.
    if (relative.startsWith(base))
        return relative;
    return `${base}${relative}`;
}
/**
 * Rewrite every <img src> (and <a href> that points at an image file)
 * inside an HTML string through resolveImageUrl. Uses jsdom so it is
 * parser-safe rather than a brittle regex. Non-HTML or empty input is
 * returned unchanged.
 */
function resolveImagesInHtml(html) {
    if (!html || typeof html !== 'string' || !html.includes('<'))
        return html;
    let document;
    try {
        document = new (require('jsdom').JSDOM)('').window.document;
    }
    catch {
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
    }
    catch {
        return html;
    }
}
//# sourceMappingURL=s3.js.map