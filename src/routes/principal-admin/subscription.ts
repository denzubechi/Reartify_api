import express, { Request, Response, NextFunction } from 'express';
import prisma from '../../database/db';

const router = express.Router();
// Create or Update a Subscription Plan
// router.post('/subscription-plan', async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const {
//       name,
//       price,
//       maxStores,
//       maxProductsPerStore,
//       maxStoreThemes,
//       noInventoryLocations, // Add maxInventoryLocations field
//       transactionFeePercent,
//       productCommission,
//       allowsCustomDomain,
//     } = req.body;

    
//     // Check if the plan with the same name already exists
//     const existingPlan = await prisma.subscriptionPlan.findUnique({
//       where: { name },
//     });

//     if (existingPlan) {
//       return res.status(400).json({ error: 'Subscription plan with the same name already exists' });
//     }

//     // Create a new subscription plan
//     const newPlan = await prisma.subscriptionPlan.create({
//       data: {
//         name,
//         // price,
        
//         // maxProductsPerStore,
//         // maxStoreThemes,
//         // noInventoryLocations, // Include maxInventoryLocations
//         // transactionFeePercent,
//         // productCommission,
//         // allowsCustomDomain,
//       },
//     });

//     res.status(201).json({ message: 'Subscription plan created successfully', plan: newPlan });
//   } catch (error) {
//     next(error);
//   }
// });

// // Update a Subscription Plan
// // router.put('/subscription-plans/:planId', async (req: Request, res: Response, next: NextFunction) => {
// //   try {
// //     const { planId } = req.params;
// //     const {
// //       name,
// //       price,
// //       maxStores,
// //       maxProductsPerStore,
// //       maxStoreThemes,
// //       noInventoryLocations, // Add maxInventoryLocations field
// //       transactionFeePercent,
// //       productCommission,
// //       allowsCustomDomain,
// //     } = req.body;

// //     // Check if the plan exists
// //     const existingPlan = await prisma.subscriptionPlan.findUnique({
// //       where: { id: parseInt(planId) },
// //     });

// //     if (!existingPlan) {
// //       return res.status(404).json({ error: 'Subscription plan not found' });
// //     }

// //     // Update the subscription plan
// //     const updatedPlan = await prisma.subscriptionPlan.update({
// //       where: { id: parseInt(planId) },
// //       data: {
// //         name,
// //         price,
// //         maxStores,
// //         maxProductsPerStore,
// //         maxStoreThemes,
// //         noInventoryLocations, // Include maxInventoryLocations
// //         transactionFeePercent,
// //         productCommission,
// //         allowsCustomDomain,
// //       },
// //     });

// //     res.status(200).json({ message: 'Subscription plan updated successfully', plan: updatedPlan });
// //   } catch (error) {
// //     next(error);
// //   }
// // });

export { router as SubscriptionPlanRouter };
