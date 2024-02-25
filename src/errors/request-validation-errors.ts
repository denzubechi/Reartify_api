
import { NextFunction, Request, Response } from 'express';

export function requestErrHandling(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err.message === 'User not found') {
    return res.status(404).json({ error: 'User not found' });
  }

  if (err.message === 'Invalid password') {
    return res.status(401).json({ error: 'Invalid password' });
  }

  if (err.message === 'Email not verified') {
    return res.status(401).json({ error: 'Email not verified' });
  }

  // Handle other errors or pass to default error handler
  next(err);
}
