import { Router } from 'express';
import * as ctrl from '../controllers/domain.controller';
import { authenticate, requireAuth, requireSuperAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { paginationSchema } from '../validators/common.schema';
import { apiLimiter } from '../middleware/rate-limiter';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', requireSuperAdmin, validate(paginationSchema), ctrl.listDomains);
router.post('/', requireSuperAdmin, ctrl.createDomain);
router.post('/register', ctrl.registerDomain);
router.get('/:domainId', ctrl.getDomain);
router.put('/:domainId', ctrl.updateDomain);
router.put('/:domainId/status', requireSuperAdmin, ctrl.updateDomainStatus);
router.delete('/:domainId/cache', ctrl.clearDomainCacheController);

export default router;
