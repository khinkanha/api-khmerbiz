import { Router, Request, Response } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import domainRoutes from './domain.routes';
import contentRoutes from './content.routes';
import menuRoutes from './menu.routes';
import bannerRoutes from './banner.routes';
import mediaRoutes from './media.routes';
import settingRoutes from './setting.routes';
import websiteRoutes from './website.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// Auth
router.use('/auth', authRoutes);

// Protected routes
router.use('/users', userRoutes);
router.use('/domains', domainRoutes);
router.use('/content', contentRoutes);
router.use('/menus', menuRoutes);
router.use('/banners', bannerRoutes);
router.use('/media', mediaRoutes);
router.use('/settings', settingRoutes);

// Public website data
router.use('/site', websiteRoutes);

export default router;
