"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapSchema = exports.updateItemSchema = exports.createItemSchema = exports.contentIdParamSchema = exports.updateContentSchema = exports.createContentSchema = void 0;
const zod_1 = require("zod");
exports.createContentSchema = zod_1.z.object({
    body: zod_1.z.object({
        menu_id: zod_1.z.number().int().positive(),
        content_type: zod_1.z.number().int().min(0).max(5),
        description: zod_1.z.string().max(500000).optional(),
        lang_id: zod_1.z.number().int().positive(),
        title: zod_1.z.string().min(1).max(500),
    }),
});
exports.updateContentSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        menu_id: zod_1.z.number().int().positive().optional(),
        content_type: zod_1.z.number().int().min(0).max(5).optional(),
        description: zod_1.z.string().max(500000).optional(),
        title: zod_1.z.string().min(1).max(500).optional(),
    }),
});
exports.contentIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
    }),
});
exports.createItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(500),
        url: zod_1.z.string().max(500).optional(),
        description: zod_1.z.string().max(500000).optional(),
        item_type: zod_1.z.number().int().optional(),
        document_type: zod_1.z.string().max(100).optional(),
    }),
});
exports.updateItemSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
        itemId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(500).optional(),
        url: zod_1.z.string().max(500).optional(),
        description: zod_1.z.string().max(500000).optional(),
        document_type: zod_1.z.string().max(100).optional(),
    }),
});
exports.mapSchema = zod_1.z.object({
    params: zod_1.z.object({
        contentId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        title: zod_1.z.string().min(1).max(500),
        description: zod_1.z.string().max(500000).optional(),
        lat: zod_1.z.number().min(-90).max(90),
        lng: zod_1.z.number().min(-180).max(180),
        visible: zod_1.z.number().int().min(0).max(1),
    }),
});
//# sourceMappingURL=content.schema.js.map