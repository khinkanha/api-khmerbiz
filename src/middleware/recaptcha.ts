import { Request, Response, NextFunction } from 'express';
import { config } from '../config';
import { BadRequestError } from '../utils/errors';

export async function verifyRecaptcha(req: Request, _res: Response, next: NextFunction) {
  const token = req.body.recaptchaToken;
  if (!token) {
    return next(new BadRequestError('reCAPTCHA verification required'));
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${config.recaptcha.secret}&response=${token}`,
    });

    const data = await response.json();
    if (!data.success) {
      return next(new BadRequestError('reCAPTCHA verification failed'));
    }

    delete req.body.recaptchaToken;
    next();
  } catch (err) {
    next(new BadRequestError('reCAPTCHA verification failed'));
  }
}
