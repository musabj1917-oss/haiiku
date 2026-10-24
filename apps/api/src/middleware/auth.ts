import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export function validateBody<T>(schema: z.ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        issues: result.error.flatten()
      });
    }

    req.body = result.data;
    next();
  };
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token || token.length < 12) {
    return res.status(401).json({ error: 'Invalid token.' });
  }

  req.user = { id: 'demo-user-id', email: 'demo@example.com' };
  next();
}
