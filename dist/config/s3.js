"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.s3Client = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const index_1 = require("./index");
exports.s3Client = new client_s3_1.S3Client({
    endpoint: index_1.config.s3.endpoint,
    region: index_1.config.s3.region || 'us-east-1',
    credentials: {
        accessKeyId: index_1.config.s3.accessKeyId,
        secretAccessKey: index_1.config.s3.secretAccessKey,
    },
    forcePathStyle: false,
});
//# sourceMappingURL=s3.js.map