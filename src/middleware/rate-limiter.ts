import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { status: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: false, message: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { status: false, message: 'Too many requests. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { status: false, message: 'Upload limit reached. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
