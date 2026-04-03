import dotenv from 'dotenv';

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const DATABASE_URL = requireEnv('DATABASE_URL');
export const JWT_SECRET = requireEnv('JWT_SECRET');
export const PORT = process.env.PORT ?? '3000';
