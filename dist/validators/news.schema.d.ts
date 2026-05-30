import { z } from 'zod';
export declare const createNewsSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
    }, {
        contentId: number;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
        shortdes: z.ZodOptional<z.ZodString>;
        longdes: z.ZodOptional<z.ZodString>;
        photo: z.ZodOptional<z.ZodString>;
        publish: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodNumber>;
        status: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        priority: number;
        status?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    }, {
        title: string;
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
    };
    body: {
        title: string;
        priority: number;
        status?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    };
}, {
    params: {
        contentId: number;
    };
    body: {
        title: string;
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    };
}>;
export declare const updateNewsSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
        newsId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
        newsId: number;
    }, {
        contentId: number;
        newsId: number;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        shortdes: z.ZodOptional<z.ZodString>;
        longdes: z.ZodOptional<z.ZodString>;
        photo: z.ZodOptional<z.ZodString>;
        publish: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status?: number | undefined;
        title?: string | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    }, {
        status?: number | undefined;
        title?: string | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
        newsId: number;
    };
    body: {
        status?: number | undefined;
        title?: string | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    };
}, {
    params: {
        contentId: number;
        newsId: number;
    };
    body: {
        status?: number | undefined;
        title?: string | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        photo?: string | undefined;
        publish?: string | undefined;
    };
}>;
//# sourceMappingURL=news.schema.d.ts.map