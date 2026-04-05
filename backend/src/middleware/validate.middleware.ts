import { Request, Response, NextFunction } from 'express';

export function validateBody(requiredFields: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missing = requiredFields.filter(field => req.body[field] === undefined || req.body[field] === null || req.body[field] === '');
    if (missing.length > 0) {
      res.status(400).json({ message: `Missing required fields: ${missing.join(', ')}` });
      return;
    }
    next();
  };
}
