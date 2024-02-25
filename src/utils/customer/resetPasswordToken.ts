import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const jwtSecretKey = process.env.JWT_SECRET_KEY || '';

export const generateResetToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = res.locals.user; // Assuming the user object is available in res.locals

    // Create a JWT token with user ID as the payload
    const token = jwt.sign({ userId: user.id }, jwtSecretKey, { expiresIn: '1d' });

    // Attach the token to the request object for later use
    req.verificationToken = token;

    next();
  } catch (error) {
    next(error);
  }
};
