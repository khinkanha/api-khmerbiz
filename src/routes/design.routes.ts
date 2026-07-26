import { Router } from 'express';
import * as ctrl from '../controllers/design.controller';
import { authenticate, requireAuth } from '../middleware/auth';

const router = Router();

// All design endpoints require an authenticated session (web/super admin).
router.use(authenticate, requireAuth);

router.get('/', ctrl.getDesign);
router.put('/', ctrl.saveDesign);

export default router;
