import { Router } from 'express';
import * as ctrl from '../controllers/menu.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createMenuSchema, updateMenuSchema, reorderMenuSchema } from '../validators/menu.schema';
import { apiLimiter } from '../middleware/rate-limiter';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/', apiLimiter, ctrl.listMenus);
router.post('/', validate(createMenuSchema), ctrl.createMenu);
router.get('/:itemId', ctrl.getMenu);
router.put('/:itemId', validate(updateMenuSchema), ctrl.updateMenu);
router.delete('/:itemId', ctrl.deleteMenu);
router.put('/:itemId/order', validate(reorderMenuSchema), ctrl.reorderMenu);
router.post('/clear-cache', ctrl.clearMenuCache);

export default router;
