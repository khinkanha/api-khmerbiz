import { z } from 'zod';
export declare const createMenuSchema: z.ZodObject<{
    body: z.ZodObject<{
        lang_id: z.ZodNumber;
        item_name: z.ZodString;
        item_url: z.ZodOptional<z.ZodString>;
        parent_id: z.ZodDefault<z.ZodNumber>;
        item_order: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        lang_id: number;
        item_name: string;
        parent_id: number;
        item_order: number;
        item_url?: string | undefined;
    }, {
        lang_id: number;
        item_name: string;
        item_url?: string | undefined;
        parent_id?: number | undefined;
        item_order?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        lang_id: number;
        item_name: string;
        parent_id: number;
        item_order: number;
        item_url?: string | undefined;
    };
}, {
    body: {
        lang_id: number;
        item_name: string;
        item_url?: string | undefined;
        parent_id?: number | undefined;
        item_order?: number | undefined;
    };
}>;
export declare const updateMenuSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        itemId: number;
    }, {
        itemId: number;
    }>;
    body: z.ZodObject<{
        lang_id: z.ZodOptional<z.ZodNumber>;
        item_name: z.ZodOptional<z.ZodString>;
        item_url: z.ZodOptional<z.ZodString>;
        parent_id: z.ZodOptional<z.ZodNumber>;
        item_order: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        lang_id?: number | undefined;
        item_name?: string | undefined;
        item_url?: string | undefined;
        parent_id?: number | undefined;
        item_order?: number | undefined;
    }, {
        lang_id?: number | undefined;
        item_name?: string | undefined;
        item_url?: string | undefined;
        parent_id?: number | undefined;
        item_order?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        itemId: number;
    };
    body: {
        lang_id?: number | undefined;
        item_name?: string | undefined;
        item_url?: string | undefined;
        parent_id?: number | undefined;
        item_order?: number | undefined;
    };
}, {
    params: {
        itemId: number;
    };
    body: {
        lang_id?: number | undefined;
        item_name?: string | undefined;
        item_url?: string | undefined;
        parent_id?: number | undefined;
        item_order?: number | undefined;
    };
}>;
export declare const reorderMenuSchema: z.ZodObject<{
    params: z.ZodObject<{
        itemId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        itemId: number;
    }, {
        itemId: number;
    }>;
    body: z.ZodObject<{
        direction: z.ZodEnum<["up", "down"]>;
    }, "strip", z.ZodTypeAny, {
        direction: "up" | "down";
    }, {
        direction: "up" | "down";
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        itemId: number;
    };
    body: {
        direction: "up" | "down";
    };
}, {
    params: {
        itemId: number;
    };
    body: {
        direction: "up" | "down";
    };
}>;
//# sourceMappingURL=menu.schema.d.ts.map