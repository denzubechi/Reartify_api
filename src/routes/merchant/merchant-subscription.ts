import express, { Request, Response, NextFunction } from 'express';
import prisma from '../../database/db';
import axios from 'axios';
import { isAuthenticated } from '../../middlewares/merchant-middlewares/is-authenticated';

const router = express.Router();

const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || ''
const FLUTTERWAVE_BASE_URL = process.env.FLUTTERWAVE_BASE_URL || '';

// Function to initiate a Flutterwave subscription payment
const initiateFlutterwaveSubscription = async (planId: string, merchantId: number, userEmail: string,userName: string) => {
  try {
    const txRef = generateUniqueTransactionReference(); 
    const response = await axios.post(
      `${FLUTTERWAVE_BASE_URL}/v3/payments`,
      {
        tx_ref: txRef,
        currency: 'USD', 
        amount: 9.95,
        payment_type: 'card',
        redirect_url: 'http://localhost:5000/payment/success', 
        customer: {
          email: userEmail, 
          phonenumber: merchantId, 
          name: userName,
        },
        payment_plan: planId, 
      },
      {
        headers: {
          Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        },
      }
    );

    // Handle the response from Flutterwave, e.g., return the payment link
    return response.data.data.link;
  } catch (error) {
    console.log(error)
    throw error;
  }
};

// Function to generate a unique transaction reference
const generateUniqueTransactionReference = () => {
  //logic to generate a unique reference ( timestamp + random string)
  const timestamp = Date.now().toString();
  const randomString = Math.random().toString(36).substring(7);
  return `${timestamp}-${randomString}`;
};

// Allow a merchant to choose a plan and initiate a Flutterwave subscription payment
router.post('/subscribe',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { planId } = req.body;
      const merchantId = (req.user as { id: number }).id; 
      const userEmail = (req.user as { email: string }).email; 
      const userName = (req.user as { username: string }).username;

      // Initiate a Flutterwave subscription payment
      const paymentLink = await initiateFlutterwaveSubscription(planId, merchantId, userEmail,userName);

      //Redirect the merchant to the payment page
      res.redirect(paymentLink);
    } catch (error) {
        console.log(error)
      next(error);
    }
  });

// Update chosen plan route after Flutterwave payment success
router.put('/update-subscription',
  isAuthenticated,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const merchantId = (req.user as { id: number }).id; // Assuming you have an authentication middleware
      const { planId } = req.body;

      // Retrieve the merchant's current subscription plan
      const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
        include: { subscriptionPlan: true },
      });

      if (!merchant) {
        return res.status(404).json({ error: 'Merchant not found' });
      }

      // Check if the selected plan exists
      const selectedPlan = await prisma.subscriptionPlan.findUnique({
        where: { id: planId },
      });

      if (!selectedPlan) {
        return res.status(404).json({ error: 'Selected plan not found' });
      }

      // Update the merchant's chosen plan in your database
      await prisma.merchant.update({
        where: { id: merchantId },
        data: {
          subscriptionPlan: {
            connect: { id: planId },
          },
        },
      });

      res.status(200).json({ message: 'Chosen plan updated successfully' });
    } catch (error) {
      next(error);
    }
  });

export { router as MerchantSubscriptionRouter };
