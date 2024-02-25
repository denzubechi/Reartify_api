import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';



interface CustomRequest extends ExpressRequest {
  merchantId?: string;
}

const jwtSecretKey = process.env.JWT_SECRET_KEY || '';

export const verifyToken = (req: CustomRequest, res: Response, next: NextFunction) => {
  // Get token from request headers, cookies, or wherever you are sending it
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  jwt.verify(token, jwtSecretKey, (err:any, decoded:any) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    // Attach the decoded payload to the request for further use in protected routes
    if (decoded && decoded.merchantId) {
      req.user = decoded;
    }

    next();
  });
};
