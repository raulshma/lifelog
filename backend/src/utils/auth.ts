import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './database';
import * as schema from '../models/schema';

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Can be enabled later
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  secret: process.env.BETTER_AUTH_SECRET || 'your-super-secret-auth-key',
  baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001',
  trustedOrigins: [
    process.env.CORS_ORIGIN || 'http://localhost:5173',
  ],
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.User;