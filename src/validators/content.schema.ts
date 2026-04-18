import { z } from 'zod';

export const createContentSchema = z.object({
  body: z.object({
    menu_id: z.number().int().positive(),
    content_type: z.number().int().min(0).max(5),
    description: z.string().max(500000).optional(),
    lang_id: z.number().int().positive(),
    title: z.string().min(1).max(500),
  }),
});

export const updateContentSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    menu_id: z.number().int().positive().optional(),
    content_type: z.number().int().min(0).max(5).optional(),
    description: z.string().max(500000).optional(),
    title: z.string().min(1).max(500).optional(),
  }),
});

export const contentIdParamSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
  }),
});

export const createItemSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).max(500),
    url: z.string().max(500).optional(),
    description: z.string().max(500000).optional(),
    item_type: z.number().int(),
    document_type: z.string().max(100).optional(),
  }),
});

export const updateItemSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
    itemId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    url: z.string().max(500).optional(),
    description: z.string().max(500000).optional(),
    document_type: z.string().max(100).optional(),
  }),
});

export const mapSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).max(500),
    description: z.string().max(500000).optional(),
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    visible: z.number().int().min(0).max(1),
  }),
});
