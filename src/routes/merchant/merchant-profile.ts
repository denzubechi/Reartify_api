import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../../database/db';
import { isAuthenticated } from '../../middlewares/merchant-middlewares/is-authenticated';


const router = express.Router();

interface CustomRequest extends Request {
    merchantId?: number;
  }

// Display Profile Route
router.get('/profile', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
      const merchantId = req.merchantId;
  
      // Fetch merchant details from the database
      const merchant = await prisma.merchant.findUnique({
        where: { id: merchantId },
      });
  
      if (!merchant) {
        return res.status(404).json({ message: 'Merchant not found' });
      }
      res.status(200).json({ merchant });
    } catch (error) {
      next(error);
    }
  });

  // Update Profile Route - Username
router.put('/username', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const merchantId = req.merchantId;
        const { username } = req.body;

        // Update username in the database
        const updatedMerchant = await prisma.merchant.update({
            where: { id: merchantId },
            data: { username },
        });

        res.status(200).json({ message: 'Username updated successfully', merchant: updatedMerchant });
    } catch (error) {
        next(error);
    }
});
//Update Merchant Profile
router.put('/profile', isAuthenticated,  async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const merchantId = req.merchantId;
        const { username, profilePhoto, lastName, firstName } = req.body;

        // Construct the update input object
        const updatedMerchantData = {
            // Make sure the property names match your Prisma schema
            username: { set: username },
            profilePhoto: { set: profilePhoto },
            lastName:{set:lastName},
            firstName:{set:firstName}
           

        };

        // Update merchant details in the database
        const updatedMerchant = await prisma.merchant.update({
            where: { id: merchantId },
            data: updatedMerchantData,
        });

        res.status(200).json({ message: 'Merchant profile updated successfully', merchant: updatedMerchant });
    } catch (error) {
        next(error);
    }
});


//Update Merchant Password
router.put('/update-password', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
    try {
        const merchantId = req.merchantId;
        const { currentPassword, newPassword } = req.body;

        // Fetch the current merchant data
        const merchant = await prisma.merchant.findUnique({
            where: { id: merchantId },
            select: { password: true },
        });

        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }
        // Check if the merchant's password is not null
        if (merchant.password === null) {
            return res.status(400).json({ message: 'Password not set for the merchant' });
        }
        // Compare the provided current password with the stored hashed password
        const passwordMatch = await bcrypt.compare(currentPassword, merchant.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await prisma.merchant.update({
            where: { id: merchantId },
            data: { password: hashedNewPassword },
        });

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
});


export { router as MerchantProfileRouter };
