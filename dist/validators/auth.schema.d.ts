import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
        recaptchaToken: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        username: string;
        recaptchaToken?: string | undefined;
    }, {
        password: string;
        username: string;
        recaptchaToken?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        username: string;
        recaptchaToken?: string | undefined;
    };
}, {
    body: {
        password: string;
        username: string;
        recaptchaToken?: string | undefined;
    };
}>;
export declare const signupSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
        full_name: z.ZodString;
        phone: z.ZodString;
        email: z.ZodString;
        domain_name: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        password: string;
        email: string;
        username: string;
        full_name: string;
        phone: string;
        domain_name?: string | undefined;
    }, {
        password: string;
        email: string;
        username: string;
        full_name: string;
        phone: string;
        domain_name?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        password: string;
        email: string;
        username: string;
        full_name: string;
        phone: string;
        domain_name?: string | undefined;
    };
}, {
    body: {
        password: string;
        email: string;
        username: string;
        full_name: string;
        phone: string;
        domain_name?: string | undefined;
    };
}>;
export declare const verifyAccountSchema: z.ZodObject<{
    body: z.ZodObject<{
        username: z.ZodString;
        code: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
        code: string;
    }, {
        username: string;
        code: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        username: string;
        code: string;
    };
}, {
    body: {
        username: string;
        code: string;
    };
}>;
export declare const forgotPasswordSchema: z.ZodObject<{
    params: z.ZodObject<{
        username: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        username: string;
    }, {
        username: string;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        username: string;
    };
}, {
    params: {
        username: string;
    };
}>;
export declare const refreshTokenSchema: z.ZodObject<{
    body: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        refreshToken: string;
    };
}, {
    body: {
        refreshToken: string;
    };
}>;
//# sourceMappingURL=auth.schema.d.ts.map