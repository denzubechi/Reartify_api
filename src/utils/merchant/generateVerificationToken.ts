import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const jwtSecretKey = process.env.JWT_SECRET_KEY || '';

declare global {
  namespace Express {
    interface Request {
      verificationToken?: string;
    }
  }
}

export const generateVerificationToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const merchant = res.locals.merchant; // Assuming the user object is available in res.locals
    // Create a JWT token with merchant ID as the payload
    const token = jwt.sign({ merchantId: merchant.id }, jwtSecretKey, { expiresIn: '1d' });
    // Attach the token to the request object for later use
    req.verificationToken = token;
    next();
  } catch (error) {
    next(error);
  }
};
