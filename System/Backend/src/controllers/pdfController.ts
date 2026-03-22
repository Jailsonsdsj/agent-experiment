import { NextFunction, Request, Response } from 'express';

export function generatePdf(_req: Request, res: Response, _next: NextFunction): void {
  res.status(501).json({ error: 'Not implemented' });
}
