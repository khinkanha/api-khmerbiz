"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFileField = resolveFileField;
const crypto_1 = __importDefault(require("crypto"));
const s3_1 = require("./s3");
const Media_1 = require("../models/Media");
/**
 * Resolve a file field: if a file was uploaded, upload it to S3.
 * Optionally create a record in tblphotos.
 * Returns both the S3 key and the full public URL.
 */
async function resolveFileField(file, fallbackString, folder, options) {
    if (file) {
        const { key } = await (0, s3_1.uploadFileToS3)(file.buffer, file.originalname, file.mimetype, folder);
        if (options?.recordInPhotos && options.domainId) {
            const code = crypto_1.default.createHash('md5').update(key).digest('hex');
            const exists = await Media_1.Media.isExist(code, options.domainId);
            if (!exists) {
                await Media_1.Media.query().insert({
                    file_name: key,
                    domain_id: options.domainId,
                    code,
                    title: options.title || null,
                    server_id: 1,
                });
            }
        }
        return { key, url: (0, s3_1.getPublicUrl)(key) };
    }
    if (fallbackString) {
        return { key: fallbackString, url: (0, s3_1.getPublicUrl)(fallbackString) };
    }
    return { key: undefined, url: undefined };
}
//# sourceMappingURL=upload-helper.js.map