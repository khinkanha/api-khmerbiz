"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLanguageSchema = exports.addSocialMediaSchema = exports.updateLogoSchema = exports.updateBannerSettingSchema = exports.updateMenuSettingSchema = exports.updateGeneralSchema = void 0;
const zod_1 = require("zod");
exports.updateGeneralSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().max(200).optional(),
        footer: zod_1.z.string().max(5000).optional(),
        theme: zod_1.z.number().int().min(0).max(5).optional(),
        page_style: zod_1.z.number().int().min(0).max(3).optional(),
        screen_mode: zod_1.z.string().max(50).optional(),
        tracking_id: zod_1.z.string().max(100).optional(),
        chat_script: zod_1.z.string().max(10000).optional(),
        background: zod_1.z.string().max(500).optional(),
        existing_background: zod_1.z.string().max(500).optional(),
    }),
});
exports.updateMenuSettingSchema = zod_1.z.object({
    body: zod_1.z.object({
        menu_position: zod_1.z.string().max(50).optional(),
        menu_align: zod_1.z.string().max(50).optional(),
    }),
});
exports.updateBannerSettingSchema = zod_1.z.object({
    body: zod_1.z.object({
        banner_position: zod_1.z.number().int().min(0).max(3).optional(),
        banner_display: zod_1.z.number().int().min(0).max(1).optional(),
        banner_mode: zod_1.z.number().int().min(0).max(1).optional(),
    }),
});
exports.updateLogoSchema = zod_1.z.object({
    body: zod_1.z.object({
        logo: zod_1.z.string().max(500).optional(),
        existing_logo: zod_1.z.string().max(500).optional(),
        mobile_logo: zod_1.z.string().max(500).optional(),
        existing_mobile_logo: zod_1.z.string().max(500).optional(),
        logo_position: zod_1.z.string().max(50).optional(),
        logo_align: zod_1.z.string().max(50).optional(),
    }),
});
exports.addSocialMediaSchema = zod_1.z.object({
    body: zod_1.z.object({
        stype: zod_1.z.number().int().min(1).max(7),
        link: zod_1.z.string().max(500),
    }),
});
exports.addLanguageSchema = zod_1.z.object({
    body: zod_1.z.object({
        lang_name: zod_1.z.string().min(1).max(100),
        flag: zod_1.z.number().int().min(0).max(4),
    }),
});
//# sourceMappingURL=setting.schema.js.map