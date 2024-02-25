import NodeCache from 'node-cache';
import { Request, Response, NextFunction } from 'express';

const tokenCache = new NodeCache();

declare global {
  namespace Express {
    interface Request {
      verificationCode?: string;
      verificationCodeExpiration?: number;
    }
  }
}

export const generateVerificationCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Generate a random 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    // Attach the code and expiration timestamp to the request object for later use
    req.verificationCode = verificationCode;

    // Store the verification code and expiration timestamp in the token cache
    tokenCache.set(verificationCode, true, 3600);

    next();
  } catch (error) {
    next(error);
  }
};
