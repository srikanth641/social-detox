import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env if present
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const ENV = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  DATABASE_URL: process.env.DATABASE_URL || '',
  MONGODB_URI: process.env.MONGODB_URI || '',
  AI_API_KEY: process.env.AI_API_KEY || '',
  AI_MODEL: process.env.AI_MODEL || 'gemini-1.5-flash',
  JWT_SECRET: process.env.JWT_SECRET || 'social_detox_jwt_secret_dev_key_2026',
  SESSION_SECRET: process.env.SESSION_SECRET || 'social_detox_session_secret_2026',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  MOTIVATION_API_URL: process.env.MOTIVATION_API_URL || 'https://zenquotes.io/api/today',
};
