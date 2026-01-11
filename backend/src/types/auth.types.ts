import type { Request } from 'express';
import type { User, ExchangeParticipant, Exchange } from '@prisma/client';

/**
 * Request with authenticated user from Clerk
 */
export interface AuthenticatedRequest extends Request {
  user: User;
  clerkId: string;
}

/**
 * Request with magic link authentication
 */
export interface MagicLinkAuthRequest extends Request {
  magicLink: {
    token: string;
    participant: ExchangeParticipant;
    exchange: Exchange;
    user: User | null;
  };
  user?: User;
}

/**
 * Request that may or may not be authenticated
 */
export interface OptionalAuthRequest extends Request {
  user?: User;
  clerkId?: string;
}
