"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_1 = require("./index");
exports.redis = new ioredis_1.default({
    host: index_1.config.redis.host,
    port: index_1.config.redis.port,
    password: index_1.config.redis.password,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 200, 5000);
        return delay;
    },
});
exports.redis.on('error', (err) => {
    console.error('Redis connection error:', err.message);
});
exports.redis.on('connect', () => {
    console.log('Redis connected');
});
//# sourceMappingURL=redis.js.map