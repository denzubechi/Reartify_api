// Import necessary dependencies and configurations
import express, { Request, Response, NextFunction } from 'express';
import { User } from '@prisma/client';


// Middleware to check if the customer is authorized as a customer
export const isCustomer = (req: Request, res: Response, next: NextFunction) => {
  // Assuming you have a "role" property in your user object
  const user = req.user as User;
  if (user.role === 'customer') {
    // If the user is authorized as a customer, continue to the next middleware
    return next();
  }
  // If not authorized as a customer, return a forbidden response
  return res.status(403).json({ message: 'Forbidden. Access denied for this role.' });
};



