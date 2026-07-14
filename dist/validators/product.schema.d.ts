import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
    }, {
        contentId: number;
    }>;
    body: z.ZodObject<{
        name: z.ZodString;
        price: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        shortdes: z.ZodOptional<z.ZodString>;
        longdes: z.ZodOptional<z.ZodString>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        photos: z.ZodOptional<z.ZodArray<z.ZodOptional<z.ZodString>, "many">>;
        publish: z.ZodOptional<z.ZodString>;
        priority: z.ZodDefault<z.ZodNumber>;
        status: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        priority: number;
        name: string;
        status?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    }, {
        name: string;
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
    };
    body: {
        priority: number;
        name: string;
        status?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    };
}, {
    params: {
        contentId: number;
    };
    body: {
        name: string;
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    };
}>;
export declare const updateProductSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
        productId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
        productId: number;
    }, {
        contentId: number;
        productId: number;
    }>;
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        price: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
        shortdes: z.ZodOptional<z.ZodString>;
        longdes: z.ZodOptional<z.ZodString>;
        features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        photos: z.ZodOptional<z.ZodArray<z.ZodOptional<z.ZodString>, "many">>;
        publish: z.ZodOptional<z.ZodString>;
        priority: z.ZodOptional<z.ZodNumber>;
        status: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        name?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    }, {
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        name?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
        productId: number;
    };
    body: {
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        name?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    };
}, {
    params: {
        contentId: number;
        productId: number;
    };
    body: {
        status?: number | undefined;
        priority?: number | undefined;
        shortdes?: string | undefined;
        longdes?: string | undefined;
        publish?: string | undefined;
        name?: string | undefined;
        price?: number | undefined;
        currency?: string | undefined;
        features?: string[] | undefined;
        photos?: (string | undefined)[] | undefined;
    };
}>;
//# sourceMappingURL=product.schema.d.ts.map