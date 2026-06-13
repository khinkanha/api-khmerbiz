import { z } from 'zod';
export declare const updateProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        full_name: z.ZodOptional<z.ZodString>;
        phone: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        email?: string | undefined;
        full_name?: string | undefined;
        phone?: string | undefined;
    }, {
        email?: string | undefined;
        full_name?: string | undefined;
        phone?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        email?: string | undefined;
        full_name?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        email?: string | undefined;
        full_name?: string | undefined;
        phone?: string | undefined;
    };
}>;
export declare const changePasswordSchema: z.ZodObject<{
    body: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}, {
    body: {
        currentPassword: string;
        newPassword: string;
    };
}>;
export declare const createUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
        full_name: z.ZodString;
        phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
        email: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, unknown>;
        user_level: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        username: string;
        full_name: string;
        user_level: number;
        email?: string | undefined;
        phone?: string | undefined;
    }, {
        password: string;
        username: string;
        full_name: string;
        email?: unknown;
        phone?: unknown;
        user_level?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        username: string;
        full_name: string;
        user_level: number;
        email?: string | undefined;
        phone?: string | undefined;
    };
}, {
    body: {
        password: string;
        username: string;
        full_name: string;
        email?: unknown;
        phone?: unknown;
        user_level?: number | undefined;
    };
}>;
export declare const assignDomainSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        userId: number;
    }, {
        userId: number;
    }>;
    body: z.ZodObject<{
        domain_id: z.ZodNumber;
        user_level: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        domain_id: number;
        user_level: number;
    }, {
        domain_id: number;
        user_level: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: number;
    };
    body: {
        domain_id: number;
        user_level: number;
    };
}, {
    params: {
        userId: number;
    };
    body: {
        domain_id: number;
        user_level: number;
    };
}>;
export declare const verifyUserSchema: z.ZodObject<{
    params: z.ZodObject<{
        userId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        userId: number;
    }, {
        userId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        userId: number;
    };
}, {
    params: {
        userId: number;
    };
}>;
//# sourceMappingURL=user.schema.d.ts.map