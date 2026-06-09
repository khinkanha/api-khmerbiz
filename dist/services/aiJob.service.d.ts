import { ChatResponse } from './aiChat.service';
export interface AIJob {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: number;
    userId: number;
    domainId: number;
    result?: ChatResponse;
    error?: string;
}
export declare function createJob(userId: number, domainId: number): AIJob;
export declare function getJob(jobId: string, userId: number, domainId: number): AIJob | undefined;
export declare function updateJob(jobId: string, updates: Partial<AIJob>): void;
//# sourceMappingURL=aiJob.service.d.ts.map