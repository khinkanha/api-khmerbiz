import multer from 'multer';
import { config } from '../config/index';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.upload.maxFileSizeMB * 1024 * 1024,
  },
});

export default upload;
