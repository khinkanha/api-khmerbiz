import { z } from 'zod';

export const paginationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().max(200).optional(),
  }),
});

export const idParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const domainIdParamSchema = z.object({
  params: z.object({
    domainId: z.coerce.number().int().positive(),
  }),
});
