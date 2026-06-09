"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.updateJob = updateJob;
const jobs = new Map();
const JOB_TTL = 10 * 60 * 1000; // 10 minutes
const MAX_JOBS = 10000; // #14: Capacity limit
function generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function createJob(userId, domainId) {
    // #14: Reject if at capacity
    if (jobs.size >= MAX_JOBS) {
        throw new Error('Job queue at capacity. Please try again later.');
    }
    const job = {
        id: generateJobId(),
        status: 'pending',
        createdAt: Date.now(),
        userId,
        domainId,
    };
    jobs.set(job.id, job);
    return job;
}
function getJob(jobId, userId, domainId) {
    const job = jobs.get(jobId);
    // #2: Ownership check — only return job if it belongs to the requesting user
    if (!job || job.userId !== userId || job.domainId !== domainId) {
        return undefined;
    }
    return job;
}
function updateJob(jobId, updates) {
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
//# sourceMappingURL=aiJob.service.js.map