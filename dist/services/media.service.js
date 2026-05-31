"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listMedia = listMedia;
exports.requestUploadUrl = requestUploadUrl;
exports.confirmUpload = confirmUpload;
exports.getMediaUrl = getMediaUrl;
exports.uploadFile = uploadFile;
const Media_1 = require("../models/Media");
const s3_1 = require("../utils/s3");
const index_1 = require("../config/index");
const pagination_1 = require("../utils/pagination");
const errors_1 = require("../utils/errors");
const crypto_1 = __importDefault(require("crypto"));
async function listMedia(domainId, page, limit, search) {
    const { offset, limit: safeLimit } = (0, pagination_1.getPagination)(page, limit);
    let query = Media_1.Media.query().where('domain_id', domainId);
    if (search) {
        query = query.where('title', 'like', `%${search}%`);
    }
    const [items, countResult] = await Promise.all([
        query.orderBy('photo_id', 'desc').limit(safeLimit).offset(offset),
        Media_1.Media.countByDomain(domainId),
    ]);
    return { items, pagination: (0, pagination_1.buildPaginationMeta)(page, safeLimit, countResult) };
}
async function requestUploadUrl(fileName, fileType, folder, domainId) {
    if (!(0, s3_1.validateFileType)(fileType)) {
        throw new errors_1.BadRequestError('File type not allowed');
    }
    // Check domain file limit
    const count = await Media_1.Media.countByDomain(domainId);
    if (count >= index_1.config.upload.maxFilesPerDomain) {
        throw new errors_1.ForbiddenError(`File limit reached (${index_1.config.upload.maxFilesPerDomain} files)`);
    }
    const { uploadUrl, key, thumbnailKey } = await (0, s3_1.generatePresignedUploadUrl)(fileName, fileType, folder);
    return { uploadUrl, key, thumbnailKey };
}
async function confirmUpload(key, originalName, title, domainId, userId) {
    const code = crypto_1.default.createHash('md5').update(key).digest('hex');
    // Check for duplicate
    const exists = await Media_1.Media.isExist(code, domainId);
    if (exists) {
        throw new errors_1.ConflictError('File already exists');
    }
    const media = await Media_1.Media.query().insert({
        file_name: key,
        domain_id: domainId,
        code,
        title: title || originalName,
        server_id: 1,
    });
    return media;
}
function getMediaUrl(key) {
    return (0, s3_1.getPublicUrl)(key);
}
async function uploadFile(buffer, originalName, mimeType, title, domainId, folder = 'uploads') {
    if (!(0, s3_1.validateFileType)(mimeType)) {
        throw new errors_1.BadRequestError('File type not allowed');
    }
    const count = await Media_1.Media.countByDomain(domainId);
    if (count >= index_1.config.upload.maxFilesPerDomain) {
        throw new errors_1.ForbiddenError(`File limit reached (${index_1.config.upload.maxFilesPerDomain} files)`);
    }
    const { key } = await (0, s3_1.uploadFileToS3)(buffer, originalName, mimeType, folder);
    const code = crypto_1.default.createHash('md5').update(key).digest('hex');
    const exists = await Media_1.Media.isExist(code, domainId);
    if (exists) {
        throw new errors_1.ConflictError('File already exists');
    }
    const media = await Media_1.Media.query().insert({
        file_name: key,
        domain_id: domainId,
        code,
        title: title || originalName,
        server_id: 1,
    });
    return media;
}
//# sourceMappingURL=media.service.js.map