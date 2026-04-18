import { S3Client } from '@aws-sdk/client-s3';
import { config } from './index';

export const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region || 'us-east-1',
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
  forcePathStyle: false,
});
