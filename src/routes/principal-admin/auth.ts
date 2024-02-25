import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import passport from '../../config/passport-config';
import prisma from '../../database/db';
import { body, validationResult } from 'express-validator';
import { generateVerificationToken } from '../../utils/merchant/generateVerificationToken';
import { sendVerificationEmail } from '../../utils/merchant/sendVerificationEmail';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import NodeCache from 'node-cache';
dotenv.config();

const router = express.Router();

const jwtSecretKey = process.env.JWT_SECRET_KEY || '';
const tokenCache = new NodeCache();

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASS as string,
  },
});
// Validation for registration route
const registrationValidation = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post(
  '/register',
  registrationValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      // Check if the email is already registered
      const existingMerchant = await prisma.merchant.findUnique({ where: { email } });
      if (existingMerchant) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create a new unverified merchant
      const defaultPlanId = 1;
      const newMerchant = await prisma.merchant.create({
        data: {
          email,
          password: await bcrypt.hash(password, 10),
          emailVerified: false,
          // subscriptionPlan: {
          //   connect: { id: defaultPlanId },
          // },
        },
      });

      // Generate a verification token
      res.locals.merchant = newMerchant; // Attach the new merchant to the response

      next();
    } catch (error) {
      next(error);
    }
  },
  generateVerificationToken,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newMerchant = res.locals.merchant;
      const token: string = req.verificationToken ?? '';

      // Send verification email
      await sendVerificationEmail(newMerchant.email, token);

      res.status(201).json({ message: 'Merchant registered successfully. Check your email for verification.' });
    } catch (error) {
      next(error);
    }
  }
);
// Forgot Password Route
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    // Check if the email is valid
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Check if the email is associated with a merchant
    const existingMerchant = await prisma.merchant.findUnique({ where: { email } });
    if (!existingMerchant) {
      return res.status(401).json({ message: 'Email not found' });
    }

    // Generate a password reset token
    const resetToken = jwt.sign({ merchantId: existingMerchant.id }, jwtSecretKey, {
      expiresIn: '1h', // Set an expiration time for the reset token (1 hour)
    });

    // Store the reset token in the cache with an expiration time
    tokenCache.set(resetToken, true, 3600); // 3600 seconds (1 hour)

    // Send a password reset email
    const mailOptions: nodemailer.SendMailOptions = {
      from: 'your_email@example.com',
      to: email,
      subject: 'Password Reset',
      html: `
        <p>You've requested a password reset. Please click the following link to reset your password:</p>
        <a href="http://localhost:3000/auth/reset-password?resetToken=${resetToken}">Reset Password</a>
      `,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send password reset email' });
      }
      console.log('Password reset email sent:', info.response);
      res.status(200).json({ message: 'Password reset email sent. Check your email for instructions.' });
    });
  } catch (error) {
    next(error);
  }
});

// Reset Password Route
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    // Verify the reset token
    const decodedToken: any = jwt.verify(token, jwtSecretKey);
    const merchantId = decodedToken.merchantId;

    // Check if the reset token is valid
    const isTokenValid = checkIfResetTokenIsValid(token);

    if (!isTokenValid) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Update the merchant's password
    const updatedMerchant = await prisma.merchant.update({
      where: { id: merchantId },
      data: { password: await bcrypt.hash(password, 10) },
    });

    // Remove the reset token from the cache
    removeResetToken(token);

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
});

// Function to check if the reset token is valid
function checkIfResetTokenIsValid(token: string): boolean {
  return tokenCache.has(token);
}

// Function to remove the reset token from the cache
function removeResetToken(token: string): void {
  tokenCache.del(token);
}
// Account Verification Route
router.get('/verify/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    // Verify the token
    const decodedToken: any = jwt.verify(token, jwtSecretKey);
    const merchantId = decodedToken.merchantId;

    // Update merchant's status to verified
    await prisma.merchant.update({
      where: { id: merchantId },
      data: { emailVerified: true },
    });
    res.redirect('/login');
  } catch (error) {
    next(error);
  }
});

// Login Route
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(401).json({ errors: errors.array() });
  }
  // Authenticate the user using the LocalStrategy
  passport.authenticate('local', (err: Error | null, merchant: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!merchant) {
      // Authentication failed
      return res.status(401).json({ message: 'Email or password is Incorrect' });
    }
    // Authentication successful, log in the user
    req.login(merchant, (err) => {
      if (err) {
        return next(err);
      }
      // Return a success response
      return res.status(200).json({ merchant,message: 'Login successful' });
    });
  })(req, res, next);
});


// Account Verification Route
router.get('/verify/:token', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token;
    // Verify the token
    const decodedToken: any = jwt.verify(token, jwtSecretKey);
    const merchantId = decodedToken.merchantId;

    // Update merchant's status to verified
    await prisma.merchant.update({
      where: { id: merchantId },
      data: { emailVerified: true },
    });
    res.redirect('/login');
  } catch (error) {
    next(error);
  }
});

// Login Route
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  // Validate the request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Authenticate the user using the LocalStrategy
  passport.authenticate('local', (err: Error | null, merchant: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!merchant) {
      // Authentication failed
      return res.status(401).json({ message: 'Email or password is Incorrect' });
    }
    // Authentication successful, log in the user
    req.login(merchant, (err) => {
      if (err) {
        return next(err);
      }
      // Return a success response
      return res.status(200).json({ message: 'Login successful' });
    });
  })(req, res, next);
});




router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), (req, res) => {
  res.redirect('/store');
});

export { router as CartleAuthRouter };

