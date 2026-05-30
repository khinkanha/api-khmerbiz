import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    query: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        search: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        page: number;
        search?: string | undefined;
    }, {
        search?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        limit: number;
        page: number;
        search?: string | undefined;
    };
}, {
    query: {
        search?: string | undefined;
        limit?: number | undefined;
        page?: number | undefined;
    };
}>;
export declare const idParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: number;
    }, {
        id: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        id: number;
    };
}, {
    params: {
        id: number;
    };
}>;
export declare const domainIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        domainId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        domainId: number;
    }, {
        domainId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        domainId: number;
    };
}, {
    params: {
        domainId: number;
    };
}>;
//# sourceMappingURL=common.schema.d.ts.map