"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNewsSchema = exports.createNewsSchema = void 0;
const zod_1 = require("zod");
exports.createNewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(500),
        shortdes: zod_1.z.string().max(5000).optional(),
        longdes: zod_1.z.string().max(500000).optional(),
        photo: zod_1.z.string().max(500).optional(),
        publish: zod_1.z.string().max(50).optional(),
        priority: zod_1.z.coerce.number().int().min(0).max(4).default(0),
        status: zod_1.z.coerce.number().int().optional(),
    }),
});
exports.updateNewsSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
        newsId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(500).optional(),
        shortdes: zod_1.z.string().max(5000).optional(),
        longdes: zod_1.z.string().max(500000).optional(),
        photo: zod_1.z.string().max(500).optional(),
        publish: zod_1.z.string().max(50).optional(),
        priority: zod_1.z.coerce.number().int().min(0).max(4).optional(),
        status: zod_1.z.coerce.number().int().optional(),
    }),
});
//# sourceMappingURL=news.schema.js.map