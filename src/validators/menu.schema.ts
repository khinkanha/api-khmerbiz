import { z } from 'zod';

export const createMenuSchema = z.object({
  body: z.object({
    lang_id: z.number().int().positive(),
    item_name: z.string().min(1).max(200),
    item_url: z.string().max(500).optional(),
    parent_id: z.number().int().default(0),
    item_order: z.number().int().default(0),
  }),
});

export const updateMenuSchema = z.object({
  params: z.object({
    itemId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    lang_id: z.number().int().positive().optional(),
    item_name: z.string().min(1).max(200).optional(),
    item_url: z.string().max(500).optional(),
    parent_id: z.number().int().optional(),
    item_order: z.number().int().optional(),
  }),
});

export const reorderMenuSchema = z.object({
  params: z.object({
    itemId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    direction: z.enum(['up', 'down']),
  }),
});
