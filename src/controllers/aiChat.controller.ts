import { Request, Response, NextFunction } from 'express';
import { aiChatService } from '../services/aiChat.service';
import { AIUsageLog } from '../models/AIUsageLog';
import { AIOperationLog } from '../models/AIOperationLog';
import { createJob, getJob, updateJob } from '../services/aiJob.service';

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { message, context } = req.body;
    const userId = req.user!.userId;
    const domainId = req.user!.domainId;
    const userLevel = req.user!.userLevel;

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

    // Create async job
    const job = createJob();

    // Process in background
    setImmediate(async () => {
      try {
        updateJob(job.id, { status: 'processing' });

        const result = await aiChatService.processMessage(message, {
          userId,
          domainId,
          userLevel,
          langId: context?.langId,
          ipAddress,
          userAgent,
        });

        await AIUsageLog.incrementUsage(userId, domainId);

        updateJob(job.id, {
          status: 'completed',
          result,
        });
      } catch (err) {
        console.error('[AI Job] Error processing message:', err);
        updateJob(job.id, {
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
  } catch (err) {
    next(err);
  }
}

export async function getJobStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { jobId } = req.params;
    const job = getJob(jobId);

    if (!job) {
      return res.status(404).json({
        status: false,
        message: 'Job not found',
      });
    }

    const userId = req.user!.userId;
    const domainId = req.user!.domainId;
    const usageInfo = await AIUsageLog.getUsageInfo(userId, domainId);

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
  } catch (err) {
    next(err);
  }
}

export async function getUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const domainId = req.user!.domainId;

    const usageInfo = await AIUsageLog.getUsageInfo(userId, domainId);

    res.json({
      status: true,
      data: usageInfo,
    });
  } catch (err) {
    next(err);
  }
}

export async function getOperationHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const domainId = req.user!.domainId;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await AIOperationLog.getUserOperationHistory(userId, domainId, limit);

    res.json({
      status: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}

export async function getContentVersions(req: Request, res: Response, next: NextFunction) {
  try {
    const contentId = parseInt(req.params.contentId);
    const domainId = req.user!.domainId;
    const limit = parseInt(req.query.limit as string) || 10;

    // Verify content belongs to domain
    // (This would be done through the content service)

    const versions = await AIOperationLog.getOperationsByTarget('content', contentId, domainId);

    res.json({
      status: true,
      data: versions,
    });
  } catch (err) {
    next(err);
  }
}

export async function checkHealth(req: Request, res: Response, next: NextFunction) {
  try {
    // Check if Z AI is configured and accessible
    const isConfigured = aiChatService !== undefined;

    res.json({
      status: true,
      data: {
        aiEnabled: isConfigured,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    next(err);
  }
}
