import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const existingCorrelationId = req.headers['x-correlation-id'] as string;
    const correlationId = existingCorrelationId || `corr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    
    // Attach to request and response headers for distributed tracing
    req.headers['x-correlation-id'] = correlationId;
    res.setHeader('X-Correlation-ID', correlationId);
    
    next();
  }
}
