import { ChatResponse } from './aiChat.service';
export interface AIJob {
    id: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    createdAt: number;
    result?: ChatResponse;
    error?: string;
}
export declare function createJob(): AIJob;
export declare function getJob(jobId: string): AIJob | undefined;
export declare function updateJob(jobId: string, updates: Partial<AIJob>): void;
//# sourceMappingURL=aiJob.service.d.ts.map