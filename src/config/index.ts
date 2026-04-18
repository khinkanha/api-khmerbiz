import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
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
};
