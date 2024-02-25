import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import bcrypt from 'bcrypt';
import prisma from '../database/db';
import { Merchant } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const googleClientId = process.env.GOOGLE_CLIENTID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const callbackUrl = process.env.CALLBACK_URL || '';

//Serializing a Merchant
passport.serializeUser((merchant, done) => {
    const typedMerchant = merchant as Merchant;
    done(null, typedMerchant.id);
  });
  
passport.deserializeUser(async (id, done) => {
  try {
    const merchant = await prisma.merchant.findUnique({ where: { id: parseInt(id as string, 10) } });
    done(null, merchant);
  } catch (error) {
    done(error);
  }
});

passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
        
          // Proceed with local authentication
          const merchant = await prisma.merchant.findUnique({
            where: { email: email as string },
          });
          if (!merchant) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }
          if (!bcrypt.compareSync(password as string, merchant.password || '')) {
            return done(null, false, { message: 'Incorrect email or password.' });
          }
       
          return done(null, merchant);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
export default passport;
