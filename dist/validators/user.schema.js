"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUserSchema = exports.assignDomainSchema = exports.createUserSchema = exports.changePasswordSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        full_name: zod_1.z.string().min(1).max(100).optional(),
        phone: zod_1.z.string().min(9).max(20).regex(/^[0-9+]+$/).optional(),
        email: zod_1.z.string().email().max(100).optional(),
    }),
});
exports.changePasswordSchema = zod_1.z.object({
    body: zod_1.z.object({
        currentPassword: zod_1.z.string().min(1).max(100),
        newPassword: zod_1.z.string().min(6).max(100),
    }),
});
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
        password: zod_1.z.string().min(6).max(100),
        full_name: zod_1.z.string().min(1).max(100),
        phone: zod_1.z.preprocess(v => v === '' ? undefined : v, zod_1.z.string().min(9).max(20).regex(/^[0-9+]+$/).optional()),
        email: zod_1.z.preprocess(v => v === '' ? undefined : v, zod_1.z.string().email().max(100).optional()),
        user_level: zod_1.z.number().int().default(2),
    }),
});
exports.assignDomainSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.coerce.number().int().positive(),
    }),
    body: zod_1.z.object({
        domain_id: zod_1.z.number().int().positive(),
        user_level: zod_1.z.number().int(),
    }),
});
exports.verifyUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        userId: zod_1.z.coerce.number().int().positive(),
    }),
});
//# sourceMappingURL=user.schema.js.map