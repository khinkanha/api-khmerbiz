"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJob = getJob;
exports.updateJob = updateJob;
const jobs = new Map();
const JOB_TTL = 10 * 60 * 1000; // 10 minutes
function generateJobId() {
    return `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
function createJob() {
    const job = {
        id: generateJobId(),
        status: 'pending',
        createdAt: Date.now(),
    };
    jobs.set(job.id, job);
    return job;
}
function getJob(jobId) {
    return jobs.get(jobId);
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