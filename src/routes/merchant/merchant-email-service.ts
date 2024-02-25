import express, { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../../database/db'; // Import your Prisma client instance
import { isAuthenticated } from '../../middlewares/merchant-middlewares/is-authenticated';

const router = express.Router();

interface CustomRequest extends Request {
  merchantId?: number;
}
const smtpService = process.env.SMTP_SERVICE || '';
const smtpHost = process.env.SMTP_HOST || '';
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

// Send Newsletter Emails to Store Users and Save Sent Newsletter
router.post('/send-newsletter/', isAuthenticated, async (req: CustomRequest, res: Response, next: NextFunction) => {
});


export { router as MerchantNewsletterRouter };
