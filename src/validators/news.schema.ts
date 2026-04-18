import { z } from 'zod';

export const createNewsSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).max(500),
    shortdes: z.string().max(5000).optional(),
    longdes: z.string().max(500000).optional(),
    photo: z.string().max(500).optional(),
    publish: z.string().max(50).optional(),
    priority: z.number().int().min(0).max(4).default(0),
  }),
});

export const updateNewsSchema = z.object({
  params: z.object({
    contentId: z.coerce.number().int().positive(),
    newsId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    title: z.string().min(1).max(500).optional(),
    shortdes: z.string().max(5000).optional(),
    longdes: z.string().max(500000).optional(),
    photo: z.string().max(500).optional(),
    publish: z.string().max(50).optional(),
    priority: z.number().int().min(0).max(4).optional(),
    status: z.number().int().optional(),
  }),
});
