"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reorderMenuSchema = exports.updateMenuSchema = exports.createMenuSchema = void 0;
const zod_1 = require("zod");
exports.createMenuSchema = zod_1.z.object({
    body: zod_1.z.object({
        lang_id: zod_1.z.number().int().positive(),
        item_name: zod_1.z.string().min(1).max(200),
        item_url: zod_1.z.string().max(500).optional(),
        parent_id: zod_1.z.number().int().default(0),
        item_order: zod_1.z.number().int().default(0),
    }),
});
exports.updateMenuSchema = zod_1.z.object({
    params: zod_1.z.object({
        itemId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        lang_id: zod_1.z.number().int().positive().optional(),
        item_name: zod_1.z.string().min(1).max(200).optional(),
        item_url: zod_1.z.string().max(500).optional(),
        parent_id: zod_1.z.number().int().optional(),
        item_order: zod_1.z.number().int().optional(),
    }),
});
exports.reorderMenuSchema = zod_1.z.object({
    params: zod_1.z.object({
        itemId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        direction: zod_1.z.enum(['up', 'down']),
    }),
});
//# sourceMappingURL=menu.schema.js.map