"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
exports.config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isDev: (process.env.NODE_ENV || 'development') === 'development',
    db: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306', 10),
        database: process.env.DB_NAME || 'khmerbiz',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
    },
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'change-this',
        accessExpiry: process.env.JWT_ACCESS_EXPIRY || '1h',
        refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
    },
    s3: {
        endpoint: process.env.AWS_ENDPOINT_URL || 'https://sgp1.digitaloceanspaces.com',
        bucket: process.env.S3_BUCKET_NAME || 'khmer',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
        region: process.env.S3_REGION || '',
        photoBaseUrl: process.env.PHOTO_BASE_URL || 'https://khmer.sgp1.digitaloceanspaces.com/',
    },
    upload: {
        maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
        maxFilesPerDomain: parseInt(process.env.MAX_FILES_PER_DOMAIN || '500', 10),
    },
    zai: {
        apiKey: process.env.ZAI_API_KEY || '',
        baseUrl: process.env.ZAI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
        model: process.env.ZAI_MODEL || 'glm-4',
        temperature: parseFloat(process.env.ZAI_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.ZAI_MAX_TOKENS || '4096', 10),
    },
    recaptcha: {
        secret: process.env.RECAPTCHA_SECRET || '',
    },
};
//# sourceMappingURL=index.js.map