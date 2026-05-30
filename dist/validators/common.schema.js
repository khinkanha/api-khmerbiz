"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.domainIdParamSchema = exports.idParamSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
exports.paginationSchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
        search: zod_1.z.string().max(200).optional(),
    }),
});
exports.idParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.coerce.number().int().positive(),
    }),
});
exports.domainIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        domainId: zod_1.z.coerce.number().int().positive(),
    }),
});
//# sourceMappingURL=common.schema.js.map