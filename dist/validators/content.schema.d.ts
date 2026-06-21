import { z } from 'zod';
export declare const createContentSchema: z.ZodObject<{
    body: z.ZodObject<{
        menu_id: z.ZodNumber;
        content_type: z.ZodNumber;
        description: z.ZodOptional<z.ZodString>;
        lang_id: z.ZodNumber;
        title: z.ZodString;
        status: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        lang_id: number;
        menu_id: number;
        content_type: number;
        status?: number | undefined;
        description?: string | undefined;
    }, {
        title: string;
        lang_id: number;
        menu_id: number;
        content_type: number;
        status?: number | undefined;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        title: string;
        lang_id: number;
        menu_id: number;
        content_type: number;
        status?: number | undefined;
        description?: string | undefined;
    };
}, {
    body: {
        title: string;
        lang_id: number;
        menu_id: number;
        content_type: number;
        status?: number | undefined;
        description?: string | undefined;
    };
}>;
export declare const updateContentSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
    }, {
        contentId: number;
    }>;
    body: z.ZodObject<{
        menu_id: z.ZodOptional<z.ZodNumber>;
        content_type: z.ZodOptional<z.ZodNumber>;
        description: z.ZodOptional<z.ZodString>;
        title: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        status?: number | undefined;
        title?: string | undefined;
        description?: string | undefined;
        menu_id?: number | undefined;
        content_type?: number | undefined;
    }, {
        status?: number | undefined;
        title?: string | undefined;
        description?: string | undefined;
        menu_id?: number | undefined;
        content_type?: number | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
    };
    body: {
        status?: number | undefined;
        title?: string | undefined;
        description?: string | undefined;
        menu_id?: number | undefined;
        content_type?: number | undefined;
    };
}, {
    params: {
        contentId: number;
    };
    body: {
        status?: number | undefined;
        title?: string | undefined;
        description?: string | undefined;
        menu_id?: number | undefined;
        content_type?: number | undefined;
    };
}>;
export declare const contentIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
    }, {
        contentId: number;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
    };
}, {
    params: {
        contentId: number;
    };
}>;
export declare const createItemSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
    }, {
        contentId: number;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        item_type: z.ZodOptional<z.ZodNumber>;
        document_type: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    }, {
        title: string;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
    };
    body: {
        title: string;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    };
}, {
    params: {
        contentId: number;
    };
    body: {
        title: string;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    };
}>;
export declare const updateItemSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
        itemId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
        itemId: number;
    }, {
        contentId: number;
        itemId: number;
    }>;
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        url: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        item_type: z.ZodOptional<z.ZodNumber>;
        document_type: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        title?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    }, {
        title?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
        itemId: number;
    };
    body: {
        title?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    };
}, {
    params: {
        contentId: number;
        itemId: number;
    };
    body: {
        title?: string | undefined;
        description?: string | undefined;
        url?: string | undefined;
        item_type?: number | undefined;
        document_type?: string | undefined;
    };
}>;
export declare const mapSchema: z.ZodObject<{
    params: z.ZodObject<{
        contentId: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        contentId: number;
    }, {
        contentId: number;
    }>;
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        lat: z.ZodNumber;
        lng: z.ZodNumber;
        visible: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        title: string;
        lat: number;
        lng: number;
        visible: number;
        description?: string | undefined;
    }, {
        title: string;
        lat: number;
        lng: number;
        visible: number;
        description?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    params: {
        contentId: number;
    };
    body: {
        title: string;
        lat: number;
        lng: number;
        visible: number;
        description?: string | undefined;
    };
}, {
    params: {
        contentId: number;
    };
    body: {
        title: string;
        lat: number;
        lng: number;
        visible: number;
        description?: string | undefined;
    };
}>;
//# sourceMappingURL=content.schema.d.ts.map