import 'dotenv/config';

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:3001',

  // Clerk
  clerk: {
    secretKey: process.env.CLERK_SECRET_KEY || '',
    webhookSecret: process.env.CLERK_WEBHOOK_SECRET || '',
  },

  // Database
  databaseUrl: process.env.DATABASE_URL || '',

  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // Resend (Email)
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    fromEmail: process.env.EMAIL_FROM || 'noreply@yourapp.com',
  },

  // Twilio (SMS)
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  // Magic Links
  magicLink: {
    expiryDays: parseInt(process.env.MAGIC_LINK_EXPIRY_DAYS || '30', 10),
    secret: process.env.MAGIC_LINK_SECRET || 'default-secret-change-me',
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
} as const;

// Validate required config in production
export function validateConfig(): void {
  const required = [
    'CLERK_SECRET_KEY',
    'DATABASE_URL',
  ];

  if (config.isProd) {
    required.push('CLERK_WEBHOOK_SECRET');
    // OPENAI_API_KEY and RESEND_API_KEY are optional - features will be disabled if not set
  }

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
