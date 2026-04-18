import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    full_name: z.string().min(1).max(100).optional(),
    phone: z.string().min(9).max(20).regex(/^[0-9+]+$/).optional(),
    email: z.string().email().max(100).optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1).max(100),
    newPassword: z.string().min(6).max(100),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
    password: z.string().min(6).max(100),
    full_name: z.string().min(1).max(100),
    phone: z.string().min(9).max(20).regex(/^[0-9+]+$/).optional(),
    email: z.string().email().max(100).optional(),
    user_level: z.number().int().default(2),
  }),
});

export const assignDomainSchema = z.object({
  params: z.object({
    userId: z.coerce.number().int().positive(),
  }),
  body: z.object({
    domain_id: z.number().int().positive(),
    user_level: z.number().int(),
  }),
});
