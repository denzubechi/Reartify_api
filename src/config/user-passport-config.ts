import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import prisma from '../database/db'; // Import your Prisma instance
import { User } from '@prisma/client';

export const configurePassport = (storeIdParam: number) => {
  passport.use(
    'user-local',
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          // Find the user by email within the specific store
          const user: User | null = await prisma.user.findFirst({
            where: {
              email,
              storeId: storeIdParam, // Use the storeIdParam argument
            },
          });

          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          // Compare the password
          const passwordMatch: boolean = await bcrypt.compare(password, user.password || '');

          if (!passwordMatch) {
            return done(null, false, { message: 'Invalid email or password' });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    const typedUser = user as User;
    done(null, typedUser.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user: User | null = await prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (!user) {
        return done(new Error('User not found'));
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });
};
