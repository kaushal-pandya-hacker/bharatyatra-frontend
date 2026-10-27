import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          success: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Invalid request payload parameters',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        });
      }
      next(error);
    }
  };
}
