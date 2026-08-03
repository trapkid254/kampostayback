'use strict';

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const requiredInProduction = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];

function getEnv(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined || value === '') {
    return defaultValue;
  }
  return value;
}

function getBool(key, defaultValue = false) {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function getInt(key, defaultValue) {
  const value = process.env[key];
  if (value === undefined || value === '') return defaultValue;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? defaultValue : parsed;
}

const env = {
  NODE_ENV: getEnv('NODE_ENV', 'development'),
  PORT: getInt('PORT', 5000),
  APP_NAME: getEnv('APP_NAME', 'KampoStay'),
  APP_URL: getEnv('APP_URL', 'http://localhost:5000'),
  CLIENT_URL: getEnv('CLIENT_URL', 'http://localhost:3000'),
  MONGODB_URI: getEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017/kampostay'),
  JWT_ACCESS_SECRET: getEnv('JWT_ACCESS_SECRET', 'dev-access-secret-change-in-production'),
  JWT_REFRESH_SECRET: getEnv('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-in-production'),
  JWT_ACCESS_EXPIRES: getEnv('JWT_ACCESS_EXPIRES', '15m'),
  JWT_REFRESH_EXPIRES: getEnv('JWT_REFRESH_EXPIRES', '7d'),
  BCRYPT_ROUNDS: getInt('BCRYPT_ROUNDS', 12),
  COOKIE_SECRET: getEnv('COOKIE_SECRET', 'dev-cookie-secret'),
  SMTP_HOST: getEnv('SMTP_HOST', ''),
  SMTP_PORT: getInt('SMTP_PORT', 587),
  SMTP_USER: getEnv('SMTP_USER', ''),
  SMTP_PASS: getEnv('SMTP_PASS', ''),
  EMAIL_FROM: getEnv('EMAIL_FROM', 'noreply@kampostay.co.ke'),
  MPESA_CONSUMER_KEY: getEnv('MPESA_CONSUMER_KEY', ''),
  MPESA_CONSUMER_SECRET: getEnv('MPESA_CONSUMER_SECRET', ''),
  MPESA_SHORTCODE: getEnv('MPESA_SHORTCODE', '0705797795'),
  MPESA_PASSKEY: getEnv('MPESA_PASSKEY', ''),
  MPESA_CALLBACK_URL: getEnv('MPESA_CALLBACK_URL', ''),
  MPESA_ENV: getEnv('MPESA_ENV', 'sandbox'),
  OPENAI_API_KEY: getEnv('OPENAI_API_KEY', ''),
  CSRF_ENABLED: getBool('CSRF_ENABLED', true),
  RATE_LIMIT_WINDOW_MS: getInt('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000),
  RATE_LIMIT_MAX: getInt('RATE_LIMIT_MAX', 100),
  SEED_ADMIN_EMAIL: getEnv('SEED_ADMIN_EMAIL', 'admin@kampostay.co.ke'),
  SEED_ADMIN_PASSWORD: getEnv('SEED_ADMIN_PASSWORD', 'Admin@12345'),
};

if (env.NODE_ENV === 'production') {
  const missing = requiredInProduction.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = env;
