import { Request, Response } from 'express';

export function helloWorld(_req: Request, res: Response): void {
  res.json({ message: 'Hello World' });
}
