"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenSchema = exports.forgotPasswordSchema = exports.signupSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(3).max(50),
        password: zod_1.z.string().min(1).max(100),
        recaptchaToken: zod_1.z.string().optional(),
    }),
});
exports.signupSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
        password: zod_1.z.string().min(6).max(100),
        full_name: zod_1.z.string().min(1).max(100),
        phone: zod_1.z.string().min(9).max(20).regex(/^[0-9+]+$/, 'Invalid phone number'),
        email: zod_1.z.string().email().max(100),
        domain_name: zod_1.z.string().min(3).max(200).optional(),
    }),
});
exports.forgotPasswordSchema = zod_1.z.object({
    params: zod_1.z.object({
        username: zod_1.z.string().min(3).max(50),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1),
    }),
});
//# sourceMappingURL=auth.schema.js.map