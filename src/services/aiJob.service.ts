import { ChatResponse } from './aiChat.service';

export interface AIJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
  result?: ChatResponse;
  error?: string;
}

const jobs = new Map<string, AIJob>();
const JOB_TTL = 10 * 60 * 1000; // 10 minutes

function generateJobId(): string {
  return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function createJob(): AIJob {
  const job: AIJob = {
    id: generateJobId(),
    status: 'pending',
    createdAt: Date.now(),
  };
  jobs.set(job.id, job);
  return job;
}

export function getJob(jobId: string): AIJob | undefined {
  return jobs.get(jobId);
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
