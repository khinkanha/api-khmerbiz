import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as ctrl from '../controllers/setup.controller';

const router = Router();

router.use(authenticate);

router.get('/status', ctrl.getSetupStatus);

export default router;
