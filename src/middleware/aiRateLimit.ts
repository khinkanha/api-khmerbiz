import { Request, Response, NextFunction } from 'express';
import { AIUsageLog } from '../models/AIUsageLog';
import { UnauthorizedError } from '../utils/errors';

export interface AIUsageInfo {
  remaining_questions: number;
  daily_limit: number;
  questions_count: number;
  reset_at: string;
}

export async function checkAIQuestionLimit(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;
    const domainId = req.user?.domainId;

    if (!userId || !domainId) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const usageInfo = await AIUsageLog.getUsageInfo(userId, domainId);

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
  } catch (error) {
    console.error('Error checking AI question limit:', error);
    next(error);
  }
}

declare global {
  namespace Express {
    interface Request {
      aiUsage?: AIUsageInfo;
    }
  }
}
