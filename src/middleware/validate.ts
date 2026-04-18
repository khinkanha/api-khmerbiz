import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
      });
      req.body = result.body ?? req.body;
      req.params = result.params ?? req.params;
      req.query = result.query ?? req.query;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return next(new BadRequestError('Validation failed', errors));
      }
      next(err);
    }
  };
}
