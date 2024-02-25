import { Request, Response, NextFunction } from 'express';
import prisma from '../../database/db';
import { SubscriptionPlan } from '@prisma/client';

declare global {
    namespace Express {
      interface Request {
        subscriptionPlan?: SubscriptionPlan;
      }
    }
  }
  interface CustomRequest extends Request {
    merchantId?: number;
  }
// Middleware to check if a merchant has a subscription plan and retrieve plan details
export const checkSubscriptionPlan = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId; // Assuming req.user contains id property

    // Fetch merchant's subscription plan
    const merchant = await prisma.merchant.findUnique({
      where: { id: merchantId },
      select: { subscriptionPlanId: true },
    });

    if (!merchant || !merchant.subscriptionPlanId) {
      return res.status(400).json({ error: 'Merchant does not have a valid subscription plan' });
    }

    // Fetch subscription plan details
    const subscriptionPlan = await prisma.subscriptionPlan.findUnique({
      where: { id: merchant.subscriptionPlanId },
    });

    if (!subscriptionPlan) {
      return res.status(400).json({ error: 'Invalid subscription plan' });
    }

    // Attach the subscription plan details to the request for later use
    req.subscriptionPlan = subscriptionPlan;
    next();
  } catch (error) {
    next(error);
  }
};
// Middleware to check if the merchant can create more stores based on the subscription plan
export const checkMaxStoresLimit = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const subscriptionPlan = req.subscriptionPlan!; // Use non-null assertion
  
      // Check if the plan's maxStores limit allows creating more stores
      if (subscriptionPlan.maxStores !== -1) {
        // If not unlimited stores
        const merchantId = req.merchantId; // Assuming req.user contains id property
  
        // Count the number of stores created by the merchant
        const storeCount = await prisma.store.count({
          where: { merchantId },
        });
        if (storeCount >= subscriptionPlan.maxStores) {
          return res.status(400).json({ error: 'Your subscription plan does not allow creating more stores' });
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };

// Middleware to check maxProductsPerStore limit
export const checkMaxProductsPerStoreLimit = async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const subscriptionPlan = req.subscriptionPlan;
  
      if (subscriptionPlan && subscriptionPlan.maxProductsPerStore !== -1) {
        // If not unlimited products per store
        const merchantId = req.merchantId; // Assuming req.user contains id property
  
        // Count the number of products in the store
        const storeId = req.params.storeId; // Adjust this based on your route
        const productCount = await prisma.product.count({
          where: { storeId: Number(storeId) },
        });
  
        if (productCount >= subscriptionPlan.maxProductsPerStore) {
          return res.status(400).json({ error: 'Your subscription plan does not allow adding more products to this store' });
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  };
  

// Add more middleware functions for other subscription plan limits as needed
