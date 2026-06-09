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

const jobs = new Map<string, AIJob>();
const JOB_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_JOBS = 10000; // #14: Capacity limit

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createJob(userId: number, domainId: number): AIJob {
  // #14: Reject if at capacity
  if (jobs.size >= MAX_JOBS) {
    throw new Error('Job queue at capacity. Please try again later.');
  }

  const job: AIJob = {
    id: generateJobId(),
    status: 'pending',
    createdAt: Date.now(),
    userId,
    domainId,
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(jobId: string, userId: number, domainId: number): AIJob | undefined {
  const job = jobs.get(jobId);
  // #2: Ownership check — only return job if it belongs to the requesting user
  if (!job || job.userId !== userId || job.domainId !== domainId) {
    return undefined;
  }
  return job;
}

export function updateJob(jobId: string, updates: Partial<AIJob>): void {
  const job = jobs.get(jobId);
  if (job) {
    Object.assign(job, updates);
  }
}

// Cleanup old jobs periodically
setInterval(() => {
  const now = Date.now();
  for (const [id, job] of jobs) {
    if (now - job.createdAt > JOB_TTL) {
      jobs.delete(id);
    }
  }
}, 60 * 1000);
