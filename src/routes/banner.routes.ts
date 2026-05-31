import { Router } from 'express';
import * as ctrl from '../controllers/banner.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import upload from '../middleware/upload';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', ctrl.listBanners);
router.post('/', upload.single('image'), ctrl.addBanner);
router.delete('/:bannerId', ctrl.deleteBanner);

export default router;
