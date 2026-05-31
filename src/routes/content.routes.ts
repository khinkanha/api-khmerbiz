import { Router } from 'express';
import * as ctrl from '../controllers/content.controller';
import { authenticate, requireAuth } from '../middleware/auth';
import { validate } from '../middleware/validate';
import upload from '../middleware/upload';
import { createContentSchema, updateContentSchema, contentIdParamSchema, createItemSchema, updateItemSchema, mapSchema } from '../validators/content.schema';
import { createNewsSchema, updateNewsSchema } from '../validators/news.schema';
import { apiLimiter } from '../middleware/rate-limiter';

const router = Router();

router.use(authenticate, requireAuth);

// Content CRUD
router.get('/', apiLimiter, ctrl.listContent);
router.post('/', validate(createContentSchema), ctrl.createContent);
router.get('/:contentId', validate(contentIdParamSchema), ctrl.getContent);
router.put('/:contentId', validate(updateContentSchema), ctrl.updateContent);
router.delete('/:contentId', validate(contentIdParamSchema), ctrl.deleteContent);

// Content Items
router.get('/:contentId/items', validate(contentIdParamSchema), ctrl.listItems);
router.post('/:contentId/items', upload.single('image'), validate(createItemSchema), ctrl.createItem);
router.put('/:contentId/items/:itemId', upload.single('image'), validate(updateItemSchema), ctrl.updateItem);
router.delete('/:contentId/items/:itemId', ctrl.deleteItem);

// Map
router.put('/:contentId/map', validate(mapSchema), ctrl.updateMap);

// News
router.get('/:contentId/news', validate(contentIdParamSchema), ctrl.listNews);
router.post('/:contentId/news', upload.single('photo'), validate(createNewsSchema), ctrl.createNews);
router.get('/:contentId/news/:newsId', ctrl.getNews);
router.put('/:contentId/news/:newsId', upload.single('photo'), validate(updateNewsSchema), ctrl.updateNews);
router.delete('/:contentId/news/:newsId', ctrl.deleteNews);

export default router;
