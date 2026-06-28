"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
exports.getJobStatus = getJobStatus;
exports.getUsage = getUsage;
exports.getOperationHistory = getOperationHistory;
exports.getContentVersions = getContentVersions;
exports.checkHealth = checkHealth;
exports.confirmAction = confirmAction;
exports.rejectAction = rejectAction;
exports.respondToInputAction = respondToInputAction;
exports.rollbackOperation = rollbackOperation;
const aiChat_service_1 = require("../services/aiChat.service");
const AIUsageLog_1 = require("../models/AIUsageLog");
const AIOperationLog_1 = require("../models/AIOperationLog");
const aiJob_service_1 = require("../services/aiJob.service");
const aiInputSanitizer_1 = require("../middleware/aiInputSanitizer");
async function sendMessage(req, res, next) {
    try {
        const { message, context, conversationId } = req.body;
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        const userLevel = req.user.userLevel;
        const ipAddress = req.ip || req.connection.remoteAddress || undefined;
        const userAgent = req.get('user-agent') || undefined;
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Message is required',
                errors: ['message cannot be empty'],
            });
        }
        if (message.length > 5000) {
            return res.status(400).json({
                status: false,
                message: 'Message too long',
                errors: ['message cannot exceed 5000 characters'],
            });
        }
        // ── P0-1: Sanitise user input (prompt-injection protection) ──
        const { sanitized, reason } = (0, aiInputSanitizer_1.sanitizeAIInput)(message);
        if (!sanitized) {
            return res.status(400).json({
                status: false,
                message: reason || 'Message rejected by input sanitizer',
            });
        }
        // Create async job (#2: pass ownership)
        const job = (0, aiJob_service_1.createJob)(userId, domainId);
        // Process in background
        setImmediate(async () => {
            try {
                (0, aiJob_service_1.updateJob)(job.id, { status: 'processing' });
                const result = await aiChat_service_1.aiChatService.processMessage(sanitized, {
                    userId,
                    domainId,
                    userLevel,
                    langId: context?.langId,
                    ipAddress,
                    userAgent,
                }, conversationId);
                await AIUsageLog_1.AIUsageLog.incrementUsage(userId, domainId);
                // Generate conversationId for first message (use userId as stable key)
                const jobId = job.id;
                (0, aiJob_service_1.updateJob)(job.id, {
                    status: 'completed',
                    result: {
                        ...result,
                        conversationId: conversationId || userId,
                    },
                });
            }
            catch (err) {
                console.error('[AI Job] Error processing message:', err);
                (0, aiJob_service_1.updateJob)(job.id, {
                    status: 'failed',
                    error: err instanceof Error ? err.message : 'Unknown error',
                });
            }
        });
        // Return job ID immediately
        res.json({
            status: true,
            data: {
                jobId: job.id,
                status: 'pending',
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function getJobStatus(req, res, next) {
    try {
        const { jobId } = req.params;
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        const job = (0, aiJob_service_1.getJob)(jobId, userId, domainId);
        if (!job) {
            return res.status(404).json({
                status: false,
                message: 'Job not found',
            });
        }
        const usageInfo = await AIUsageLog_1.AIUsageLog.getUsageInfo(userId, domainId);
        res.json({
            status: true,
            data: {
                jobId: job.id,
                jobStatus: job.status,
                result: job.result,
                error: job.error,
                remainingQuestions: usageInfo.remaining_questions,
            },
        });
    }
    catch (err) {
        next(err);
    }
}
async function getUsage(req, res, next) {
    try {
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        const usageInfo = await AIUsageLog_1.AIUsageLog.getUsageInfo(userId, domainId);
        res.json({
            status: true,
            data: usageInfo,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getOperationHistory(req, res, next) {
    try {
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        const limit = parseInt(req.query.limit) || 50;
        const history = await AIOperationLog_1.AIOperationLog.getUserOperationHistory(userId, domainId, limit);
        res.json({
            status: true,
            data: history,
        });
    }
    catch (err) {
        next(err);
    }
}
async function getContentVersions(req, res, next) {
    try {
        const contentId = parseInt(req.params.contentId);
        const domainId = req.user.domainId;
        const limit = parseInt(req.query.limit) || 10;
        // Verify content belongs to domain
        // (This would be done through the content service)
        const versions = await AIOperationLog_1.AIOperationLog.getOperationsByTarget('content', contentId, domainId);
        res.json({
            status: true,
            data: versions,
        });
    }
    catch (err) {
        next(err);
    }
}
async function checkHealth(req, res, next) {
    try {
        // Check if Z AI is configured and accessible
        const isConfigured = aiChat_service_1.aiChatService !== undefined;
        res.json({
            status: true,
            data: {
                aiEnabled: isConfigured,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (err) {
        next(err);
    }
}
// ── P1-4: Confirm / reject a pending destructive action ──
async function confirmAction(req, res, next) {
    try {
        const { confirmationId } = req.params;
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        if (!confirmationId) {
            return res.status(400).json({
                status: false,
                message: 'confirmationId is required',
            });
        }
        const result = await aiChat_service_1.aiChatService.executeConfirmedAction(confirmationId, userId, domainId);
        res.json({
            status: result.success,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
async function rejectAction(req, res, next) {
    try {
        const { confirmationId } = req.params;
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        if (!confirmationId) {
            return res.status(400).json({
                status: false,
                message: 'confirmationId is required',
            });
        }
        const cancelled = aiChat_service_1.aiChatService.cancelConfirmedAction(confirmationId, userId, domainId);
        res.json({
            status: true,
            data: { cancelled, confirmationId },
        });
    }
    catch (err) {
        next(err);
    }
}
// ── Respond to a pending AI input request (e.g. choose which news section) ──
async function respondToInputAction(req, res, next) {
    try {
        const { inputId } = req.params;
        const value = Number(req.body?.value);
        const userId = req.user.userId;
        const domainId = req.user.domainId;
        if (!inputId) {
            return res.status(400).json({
                status: false,
                message: 'inputId is required',
            });
        }
        if (!Number.isFinite(value) || value <= 0) {
            return res.status(400).json({
                status: false,
                message: 'A valid value (contentId) is required',
            });
        }
        const result = await aiChat_service_1.aiChatService.executeInputResponse(inputId, value, userId, domainId);
        res.json({
            status: result.success,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
// ── P4-14: Rollback a recent AI operation ──
async function rollbackOperation(req, res, next) {
    try {
        const operationId = parseInt(req.params.operationId);
        const domainId = req.user.domainId;
        const userId = req.user.userId;
        if (!operationId || isNaN(operationId)) {
            return res.status(400).json({
                status: false,
                message: 'Valid operationId is required',
            });
        }
        const result = await aiChat_service_1.aiChatService.rollbackOperation(operationId, domainId, userId);
        res.json({
            status: result.success,
            data: result,
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=aiChat.controller.js.map