import { z } from 'zod';

export const loginSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(1).max(100),
  }),
});

export const signupSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
    password: z.string().min(6).max(100),
    full_name: z.string().min(1).max(100),
    phone: z.string().min(9).max(20).regex(/^[0-9+]+$/, 'Invalid phone number'),
    email: z.string().email().max(100),
  }),
});

export const verifyAccountSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),
    code: z.string().min(1).max(20),
  }),
});

export const forgotPasswordSchema = z.object({
  params: z.object({
    username: z.string().min(3).max(50),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1),
  }),
});
