import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncLocalStorage } from '@pallmall/logger';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const correlationId =
      (req.headers['x-correlation-id'] as string) || uuidv4();

    // Set correlation ID in response header
    res.setHeader('X-Correlation-ID', correlationId);

    // Store correlation ID in AsyncLocalStorage
    const store = new Map<string, any>();
    store.set('correlationId', correlationId);

    // Extract user ID from request if available (from JWT)
    if ((req as any)['user']?.id) {
      store.set('userId', (req as any)['user'].id);
    }

    asyncLocalStorage.run(store, () => {
      next();
    });
  }
}
