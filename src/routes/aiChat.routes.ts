import { Router } from 'express';
import * as aiChatController from '../controllers/aiChat.controller';
import { checkAIQuestionLimit } from '../middleware/aiRateLimit';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(5000),
    context: z.object({
      langId: z.number().optional(),
    }).optional(),
  }),
});

// AI Chat routes
router.post(
  '/message',
  validate(sendMessageSchema),
  checkAIQuestionLimit,
  aiChatController.sendMessage
);

router.get(
  '/usage',
  aiChatController.getUsage
);

router.get(
  '/history',
  aiChatController.getOperationHistory
);

router.get(
  '/content/:contentId/versions',
  aiChatController.getContentVersions
);

router.get(
  '/health',
  aiChatController.checkHealth
);

export default router;
