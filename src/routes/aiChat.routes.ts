import { Router } from 'express';
import * as aiChatController from '../controllers/aiChat.controller';
import { authenticate } from '../middleware/auth';
import { checkAIQuestionLimit } from '../middleware/aiRateLimit';
import { validate } from '../middleware/validate';
import { aiActionLimiter } from '../middleware/rate-limiter';
import { z } from 'zod';

const router = Router();

// Validation schemas
const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(5000),
    conversationId: z.number().int().positive().optional(),
    context: z.object({
      langId: z.number().optional(),
    }).optional(),
  }),
});

// #7: Zod schemas for new endpoints
const confirmationIdSchema = z.object({
  params: z.object({
    confirmationId: z.string().min(10).max(50),
  }),
});

const operationIdSchema = z.object({
  params: z.object({
    operationId: z.coerce.number().int().positive(),
  }),
});

const inputIdSchema = z.object({
  params: z.object({
    inputId: z.string().min(10).max(50),
  }),
  body: z.object({
    value: z.coerce.number().int().positive(),
  }),
});

// AI Chat routes
router.post(
  '/message',
  authenticate,
  validate(sendMessageSchema),
  checkAIQuestionLimit,
  aiChatController.sendMessage
);

router.get(
  '/job/:jobId',
  authenticate,
  aiChatController.getJobStatus
);

router.get(
  '/usage',
  authenticate,
  aiChatController.getUsage
);

router.get(
  '/history',
  authenticate,
  aiChatController.getOperationHistory
);

router.get(
  '/content/:contentId/versions',
  authenticate,
  aiChatController.getContentVersions
);

router.get(
  '/health',
  aiChatController.checkHealth
);

// ── P1-4: Confirm / reject destructive AI actions ──
// #7: Zod validation + #8: Rate limiting
router.post(
  '/confirm/:confirmationId',
  authenticate,
  validate(confirmationIdSchema),
  aiActionLimiter,
  aiChatController.confirmAction
);

router.post(
  '/reject/:confirmationId',
  authenticate,
  validate(confirmationIdSchema),
  aiActionLimiter,
  aiChatController.rejectAction
);

// ── Respond to a pending AI input request (e.g. choose a news section) ──
router.post(
  '/respond/:inputId',
  authenticate,
  validate(inputIdSchema),
  aiActionLimiter,
  aiChatController.respondToInputAction
);

// ── P4-14: Rollback a recent AI operation ──
router.post(
  '/rollback/:operationId',
  authenticate,
  validate(operationIdSchema),
  aiActionLimiter,
  aiChatController.rollbackOperation
);

export default router;
