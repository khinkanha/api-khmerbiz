"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAIQuestionLimit = checkAIQuestionLimit;
const AIUsageLog_1 = require("../models/AIUsageLog");
const errors_1 = require("../utils/errors");
async function checkAIQuestionLimit(req, res, next) {
    try {
        const userId = req.user?.userId;
        const domainId = req.user?.domainId;
        if (!userId || !domainId) {
            return next(new errors_1.UnauthorizedError('Authentication required'));
        }
        const usageInfo = await AIUsageLog_1.AIUsageLog.getUsageInfo(userId, domainId);
        // Attach usage info to request for use in controller
        req.aiUsage = usageInfo;
        if (usageInfo.remaining_questions <= 0) {
            return res.status(429).json({
                status: false,
                message: 'Daily question limit exceeded',
                usage: usageInfo,
                error: 'RATE_LIMIT_EXCEEDED',
            });
        }
        next();
    }
    catch (error) {
        console.error('Error checking AI question limit:', error);
        next(error);
    }
}
//# sourceMappingURL=aiRateLimit.js.map