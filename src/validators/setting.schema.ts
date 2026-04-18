import { z } from 'zod';

export const updateGeneralSchema = z.object({
  body: z.object({
    title: z.string().max(200).optional(),
    footer: z.string().max(5000).optional(),
    theme: z.number().int().min(0).max(5).optional(),
    page_style: z.number().int().min(0).max(3).optional(),
    screen_mode: z.string().max(50).optional(),
    tracking_id: z.string().max(100).optional(),
    chat_script: z.string().max(10000).optional(),
    background: z.string().max(500).optional(),
  }),
});

export const updateMenuSettingSchema = z.object({
  body: z.object({
    menu_position: z.string().max(50).optional(),
    menu_align: z.string().max(50).optional(),
  }),
});

export const updateBannerSettingSchema = z.object({
  body: z.object({
    banner_position: z.string().max(50).optional(),
    banner_display: z.number().int().min(0).max(1).optional(),
    banner_mode: z.string().max(50).optional(),
  }),
});

export const updateLogoSchema = z.object({
  body: z.object({
    logo: z.string().max(500),
    mobile_logo: z.string().max(500).optional(),
    logo_position: z.string().max(50).optional(),
    logo_align: z.string().max(50).optional(),
  }),
});

export const addSocialMediaSchema = z.object({
  body: z.object({
    stype: z.number().int().min(1).max(5),
    link: z.string().max(500),
  }),
});

export const addLanguageSchema = z.object({
  body: z.object({
    lang_name: z.string().min(1).max(100),
    flag: z.number().int().min(0).max(4),
  }),
});
