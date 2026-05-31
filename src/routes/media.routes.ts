import { Router } from 'express';
import * as ctrl from '../controllers/media.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import { uploadLimiter } from '../middleware/rate-limiter';
import upload from '../middleware/upload';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', ctrl.listMedia);
router.post('/upload', uploadLimiter, upload.single('file'), ctrl.uploadFile);
router.post('/upload-url', uploadLimiter, ctrl.requestUploadUrl);
router.post('/confirm', ctrl.confirmUpload);
router.get('/:mediaId/url', ctrl.getMediaUrl);
router.delete('/:mediaId', ctrl.deleteMedia);

export default router;
