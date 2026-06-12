"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiChatController = __importStar(require("../controllers/aiChat.controller"));
const auth_1 = require("../middleware/auth");
const aiRateLimit_1 = require("../middleware/aiRateLimit");
const validate_1 = require("../middleware/validate");
const rate_limiter_1 = require("../middleware/rate-limiter");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
// Validation schemas
const sendMessageSchema = zod_1.z.object({
    body: zod_1.z.object({
        message: zod_1.z.string().min(1).max(5000),
        conversationId: zod_1.z.number().int().positive().optional(),
        context: zod_1.z.object({
            langId: zod_1.z.number().optional(),
        }).optional(),
    }),
});
// #7: Zod schemas for new endpoints
const confirmationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        confirmationId: zod_1.z.string().min(10).max(50),
    }),
});
const operationIdSchema = zod_1.z.object({
    params: zod_1.z.object({
        operationId: zod_1.z.coerce.number().int().positive(),
    }),
});
// AI Chat routes
router.post('/message', auth_1.authenticate, (0, validate_1.validate)(sendMessageSchema), aiRateLimit_1.checkAIQuestionLimit, aiChatController.sendMessage);
router.get('/job/:jobId', auth_1.authenticate, aiChatController.getJobStatus);
router.get('/usage', auth_1.authenticate, aiChatController.getUsage);
router.get('/history', auth_1.authenticate, aiChatController.getOperationHistory);
router.get('/content/:contentId/versions', auth_1.authenticate, aiChatController.getContentVersions);
router.get('/health', aiChatController.checkHealth);
// ── P1-4: Confirm / reject destructive AI actions ──
// #7: Zod validation + #8: Rate limiting
router.post('/confirm/:confirmationId', auth_1.authenticate, (0, validate_1.validate)(confirmationIdSchema), rate_limiter_1.aiActionLimiter, aiChatController.confirmAction);
router.post('/reject/:confirmationId', auth_1.authenticate, (0, validate_1.validate)(confirmationIdSchema), rate_limiter_1.aiActionLimiter, aiChatController.rejectAction);
// ── P4-14: Rollback a recent AI operation ──
router.post('/rollback/:operationId', auth_1.authenticate, (0, validate_1.validate)(operationIdSchema), rate_limiter_1.aiActionLimiter, aiChatController.rollbackOperation);
exports.default = router;
//# sourceMappingURL=aiChat.routes.js.map