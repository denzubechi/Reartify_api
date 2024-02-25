import express, { Request, Response, NextFunction } from 'express';
import prisma from '../../database/db';
import { isAuthenticated } from '../../middlewares/merchant-middlewares/is-authenticated';
import { Order } from '@prisma/client';

const router = express.Router();

interface CustomRequest extends Request {
  merchantId?: number;
}

// Route to place a new order
router.post('/orders', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId || 0;
    const orderItems: { productId: number; quantity: number }[] = req.body.orderItems;

    // Calculate total price and create order input data
    let totalPrice = 0;
    const productConnections = orderItems.map(item => {
      return {
        id: item.productId
      };
    });

    // Fetch products and calculate total price
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: orderItems.map(item => item.productId)
        }
      }
    });

    products.forEach(product => {
      const orderItem = orderItems.find(item => item.productId === product.id);
      if (orderItem) {
        totalPrice += product.price * orderItem.quantity;
      }
    });

    // Create the order input data
    const orderInput = {
      merchantId: merchantId,
      products: {
        connect: productConnections
      },
      totalPrice: totalPrice,
      status: 'pending' // Set the initial status of the order
    };

    // Create the new order in the database
    const newOrder = await prisma.order.create({
      data: orderInput
    });

    res.status(201).json({ message: 'Order placed successfully', order: newOrder });
  } catch (error) {
    next(error);
  }
});

// Route to fetch orders for a specific merchant
router.get('/orders', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId || 0;

    // Fetch orders for the merchant
    const orders = await prisma.order.findMany({
      where: {
        merchantId: merchantId
      },
      include: {
        products: true
      }
    });

    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});

// Route to fetch all orders across all merchants
router.get('/orders/all', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    // Fetch all orders
    const orders = await prisma.order.findMany({
      include: {
        products: true,
        merchant: true
      }
    });

    res.status(200).json({ orders });
  } catch (error) {
    next(error);
  }
});

// Additional routes for updating and deleting orders can be added as needed

export { router as MerchantOrderRouter };
