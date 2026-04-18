import { Router } from 'express';
import * as ctrl from '../controllers/banner.controller';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', ctrl.listBanners);
router.post('/', ctrl.addBanner);
router.delete('/:bannerId', ctrl.deleteBanner);

export default router;
