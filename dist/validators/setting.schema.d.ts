import { z } from 'zod';
export declare const updateGeneralSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodOptional<z.ZodString>;
        footer: z.ZodOptional<z.ZodString>;
        theme: z.ZodOptional<z.ZodNumber>;
        page_style: z.ZodOptional<z.ZodNumber>;
        screen_mode: z.ZodOptional<z.ZodString>;
        tracking_id: z.ZodOptional<z.ZodString>;
        chat_script: z.ZodOptional<z.ZodString>;
        background: z.ZodOptional<z.ZodString>;
        existing_background: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        footer?: string | undefined;
        title?: string | undefined;
        screen_mode?: string | undefined;
        background?: string | undefined;
        theme?: number | undefined;
        tracking_id?: string | undefined;
        chat_script?: string | undefined;
        page_style?: number | undefined;
        existing_background?: string | undefined;
    }, {
        footer?: string | undefined;
        title?: string | undefined;
        screen_mode?: string | undefined;
        background?: string | undefined;
        theme?: number | undefined;
        tracking_id?: string | undefined;
        chat_script?: string | undefined;
        page_style?: number | undefined;
        existing_background?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        footer?: string | undefined;
        title?: string | undefined;
        screen_mode?: string | undefined;
        background?: string | undefined;
        theme?: number | undefined;
        tracking_id?: string | undefined;
        chat_script?: string | undefined;
        page_style?: number | undefined;
        existing_background?: string | undefined;
    };
}, {
    body: {
        footer?: string | undefined;
        title?: string | undefined;
        screen_mode?: string | undefined;
        background?: string | undefined;
        theme?: number | undefined;
        tracking_id?: string | undefined;
        chat_script?: string | undefined;
        page_style?: number | undefined;
        existing_background?: string | undefined;
    };
}>;
export declare const updateMenuSettingSchema: z.ZodObject<{
    body: z.ZodObject<{
        menu_position: z.ZodOptional<z.ZodString>;
        menu_align: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        menu_position?: string | undefined;
        menu_align?: string | undefined;
    }, {
        menu_position?: string | undefined;
        menu_align?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        menu_position?: string | undefined;
        menu_align?: string | undefined;
    };
}, {
    body: {
        menu_position?: string | undefined;
        menu_align?: string | undefined;
    };
}>;
export declare const updateBannerSettingSchema: z.ZodObject<{
    body: z.ZodObject<{
        banner_position: z.ZodOptional<z.ZodString>;
        banner_display: z.ZodOptional<z.ZodNumber>;
        banner_mode: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        banner_position?: string | undefined;
        banner_display?: number | undefined;
        banner_mode?: string | undefined;
    }, {
        banner_position?: string | undefined;
        banner_display?: number | undefined;
        banner_mode?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        banner_position?: string | undefined;
        banner_display?: number | undefined;
        banner_mode?: string | undefined;
    };
}, {
    body: {
        banner_position?: string | undefined;
        banner_display?: number | undefined;
        banner_mode?: string | undefined;
    };
}>;
export declare const updateLogoSchema: z.ZodObject<{
    body: z.ZodObject<{
        logo: z.ZodOptional<z.ZodString>;
        existing_logo: z.ZodOptional<z.ZodString>;
        mobile_logo: z.ZodOptional<z.ZodString>;
        existing_mobile_logo: z.ZodOptional<z.ZodString>;
        logo_position: z.ZodOptional<z.ZodString>;
        logo_align: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        logo?: string | undefined;
        mobile_logo?: string | undefined;
        logo_position?: string | undefined;
        logo_align?: string | undefined;
        existing_logo?: string | undefined;
        existing_mobile_logo?: string | undefined;
    }, {
        logo?: string | undefined;
        mobile_logo?: string | undefined;
        logo_position?: string | undefined;
        logo_align?: string | undefined;
        existing_logo?: string | undefined;
        existing_mobile_logo?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        logo?: string | undefined;
        mobile_logo?: string | undefined;
        logo_position?: string | undefined;
        logo_align?: string | undefined;
        existing_logo?: string | undefined;
        existing_mobile_logo?: string | undefined;
    };
}, {
    body: {
        logo?: string | undefined;
        mobile_logo?: string | undefined;
        logo_position?: string | undefined;
        logo_align?: string | undefined;
        existing_logo?: string | undefined;
        existing_mobile_logo?: string | undefined;
    };
}>;
export declare const addSocialMediaSchema: z.ZodObject<{
    body: z.ZodObject<{
        stype: z.ZodNumber;
        link: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        link: string;
        stype: number;
    }, {
        link: string;
        stype: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        link: string;
        stype: number;
    };
}, {
    body: {
        link: string;
        stype: number;
    };
}>;
export declare const addLanguageSchema: z.ZodObject<{
    body: z.ZodObject<{
        lang_name: z.ZodString;
        flag: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        lang_name: string;
        flag: number;
    }, {
        lang_name: string;
        flag: number;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        lang_name: string;
        flag: number;
    };
}, {
    body: {
        lang_name: string;
        flag: number;
    };
}>;
//# sourceMappingURL=setting.schema.d.ts.map