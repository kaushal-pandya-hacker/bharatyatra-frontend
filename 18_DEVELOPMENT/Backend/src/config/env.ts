import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PREFIX: z.string().default('/api/v1'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().default('postgresql://chalo_user:chalo_password@localhost:5432/chalo_farva_db'),
  JWT_SECRET: isProduction
    ? z.string().min(32, 'JWT_SECRET must be at least 32 characters in production').refine(
        (val) => !val.includes('default') && !val.includes('chalo_farva'),
        'JWT_SECRET cannot use default or placeholder values in production',
      )
    : z.string().default('test_isolated_jwt_secret_for_local_testing_only_32chars'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  GEMINI_API_KEY: z.string().optional(),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional()
});

export const env = envSchema.parse(process.env);
