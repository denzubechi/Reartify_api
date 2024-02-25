// Import necessary dependencies and configurations
import express, { Request, Response, NextFunction } from 'express';

// Middleware to check if the customer is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    // If the user is authenticated, continue to the next middleware
    return next();
  }
  // If not authenticated, return an unauthorized response
  return res.status(401).json({ message: 'Unauthorized. Please log in.' });
};



