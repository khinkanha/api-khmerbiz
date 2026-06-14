import { Router } from 'express';
import * as ctrl from '../controllers/website.controller';
import { publicLimiter } from '../middleware/rate-limiter';
import { cacheMiddleware } from '../middleware/cache';

const router = Router();

// Public endpoints — no auth required, cached
router.get('/config', publicLimiter, cacheMiddleware(120), ctrl.getSiteConfig);
router.get('/default', publicLimiter, cacheMiddleware(120), ctrl.getSiteDefault);
router.get('/menu', publicLimiter, cacheMiddleware(120), ctrl.getSiteMenu);
router.get('/home', publicLimiter, cacheMiddleware(120), ctrl.getSiteHome);
router.get('/pages/:domainId/:menuItemId', publicLimiter, cacheMiddleware(300), ctrl.getSitePage);
router.get('/news/:newsId', publicLimiter, cacheMiddleware(1200), ctrl.getSiteNews);
router.get('/article/:contentId', publicLimiter, cacheMiddleware(300), ctrl.getSiteArticle);
router.get('/banners', publicLimiter, cacheMiddleware(120), ctrl.getSiteBanners);
router.get('/feature-news/:contentId', publicLimiter, cacheMiddleware(120), ctrl.getFeatureNews);
router.get('/list-news/:contentId', publicLimiter, cacheMiddleware(120), ctrl.getListNews);

export default router;
