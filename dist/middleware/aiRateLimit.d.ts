import { Request, Response, NextFunction } from 'express';
export interface AIUsageInfo {
    remaining_questions: number;
    daily_limit: number;
    questions_count: number;
    reset_at: string;
}
export declare function checkAIQuestionLimit(req: Request, res: Response, next: NextFunction): Promise<void | Response<any, Record<string, any>>>;
declare global {
    namespace Express {
        interface Request {
            aiUsage?: AIUsageInfo;
        }
    }
}
//# sourceMappingURL=aiRateLimit.d.ts.map