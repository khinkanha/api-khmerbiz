"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFileField = resolveFileField;
const s3_1 = require("./s3");
/**
 * Resolve a file field: if a file was uploaded, upload it to S3 and return the key.
 * Otherwise fall back to the string value from the request body.
 */
async function resolveFileField(file, fallbackString, folder) {
    if (file) {
        const { key } = await (0, s3_1.uploadFileToS3)(file.buffer, file.originalname, file.mimetype, folder);
        return key;
    }
    return fallbackString;
}
//# sourceMappingURL=upload-helper.js.map