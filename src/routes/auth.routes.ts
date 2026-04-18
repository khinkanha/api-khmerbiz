import { Router } from 'express';
import * as ctrl from '../controllers/auth.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import { loginSchema, signupSchema, verifyAccountSchema, refreshTokenSchema } from '../validators/auth.schema';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rate-limiter';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/signup', authLimiter, validate(signupSchema), ctrl.signup);
router.post('/verify-account', validate(verifyAccountSchema), ctrl.verifyAccount);
router.post('/refresh', validate(refreshTokenSchema), ctrl.refreshToken);
router.post('/logout', authenticate, requireAuth, ctrl.logout);

export default router;
