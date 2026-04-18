import { Router } from 'express';
import * as ctrl from '../controllers/user.controller';
import { authenticate, requireAuth, requireWebAdmin, requireSuperAdmin } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateProfileSchema, changePasswordSchema, createUserSchema, assignDomainSchema } from '../validators/user.schema';

const router = Router();

router.use(authenticate, requireAuth);

router.get('/me', ctrl.getProfile);
router.put('/me', validate(updateProfileSchema), ctrl.updateProfile);
router.put('/me/password', validate(changePasswordSchema), ctrl.changePassword);

router.get('/', requireWebAdmin, ctrl.listUsers);
router.post('/', requireWebAdmin, validate(createUserSchema), ctrl.createUser);
router.get('/:userId', requireWebAdmin, ctrl.getUser);
router.put('/:userId/password', requireWebAdmin, ctrl.resetUserPassword);
router.put('/:userId/domain', requireSuperAdmin, validate(assignDomainSchema), ctrl.assignDomain);

export default router;
