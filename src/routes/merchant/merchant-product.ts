import express, { Request, Response, NextFunction } from 'express';
import prisma from '../../database/db';
import { isAuthenticated } from '../../middlewares/merchant-middlewares/is-authenticated';
import { Product } from '@prisma/client';

const router = express.Router();

interface CustomRequest extends Request {
  merchantId?: number;
}

const merchantExists = async (merchantId: number) => {
  const merchant = await prisma.merchant.findUnique({
    where: {
      id: merchantId,
    },
  });
  return !!merchant;
};


// Show a list of products for a merchant
router.get('/products', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId;

    // Get the list of products for the merchant
    const products = await prisma.product.findMany({
      where: {
        merchantId: merchantId,
      },
    });

    res.status(200).json({ products });
  } catch (error) {
    next(error);
  }
});

// Show details of a specific product
router.get('/products/:productId', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId;
    const productId = parseInt(req.params.productId);

    // Get the product details
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        merchantId: merchantId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.status(200).json({ product });
  } catch (error) {
    next(error);
  }
});

// Create a new product
// Create a new product
router.post('/products', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId || 0;


    const productInput={
      merchantId: merchantId,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      image: req.body.image,
      productType: req.body.productType, // Added productType field
      // Add other fields as needed
    };
   

    const newProduct = await prisma.product.create({
      data: productInput,
    });

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    next(error);
  }
});

// Update a product
router.put('/products/:productId', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId;
    const productId = parseInt(req.params.productId);

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        merchantId: merchantId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: req.body.name || product.name,
        description: req.body.description || product.description,
        price: req.body.price || product.price,
        image: req.body.image || product.image,
        productType: req.body.productType || product.productType, // Updated productType field
        // Add other fields as needed
      },
    });

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    next(error);
  }
});



// Delete a product
router.delete('/products/:productId', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const merchantId = req.merchantId;
    const productId = parseInt(req.params.productId);

    // Check if the product belongs to the merchant
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        merchantId: merchantId,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete the product
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    res.status(204).json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export { router as MerchantProductRouter };
