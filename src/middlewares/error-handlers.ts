import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom-errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    console.log(err);
    return res.status(err.statusCode).send({ error: err.serializeErrors() });
  }

  res.status(400).send({
    error: [{ message: err.message }]
  });
};
