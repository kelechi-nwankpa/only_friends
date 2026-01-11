import type { RequestHandler } from 'express';
import { clerkClient, getAuth } from '@clerk/express';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import type { AuthenticatedRequest, MagicLinkAuthRequest } from '../types/auth.types.js';

/**
 * Middleware to require Clerk authentication
 * Uses Clerk's getAuth() to extract user from the request
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    // Use Clerk's getAuth to get authentication state
    const auth = getAuth(req);
    console.log('Auth state:', { userId: auth.userId, sessionId: auth.sessionId });

    if (!auth.userId) {
      throw new AppError('UNAUTHORIZED', 'Not authenticated', 401);
    }

    const clerkId = auth.userId;

    // Get user from database
    let user = await prisma.user.findUnique({
      where: { clerkId },
    });

    // Auto-create user if doesn't exist (fallback for webhook delay)
    if (!user) {
      console.log('User not in DB, fetching from Clerk...');
      try {
        const clerkUser = await clerkClient.users.getUser(clerkId);
        user = await prisma.user.create({
          data: {
            clerkId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User',
            avatarUrl: clerkUser.imageUrl || null,
          },
        });
        console.log('User created from Clerk data:', user.id);
      } catch (createError) {
        console.error('Failed to auto-create user:', createError);
        throw new AppError('UNAUTHORIZED', 'User not found', 401);
      }
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).clerkId = clerkId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      console.error('Auth error:', error);
      next(new AppError('UNAUTHORIZED', 'Authentication failed', 401));
    }
  }
};

/**
 * Middleware to allow either Clerk auth OR Magic Link token
 * Used for exchange participation without full account
 */
export const requireAuthOrMagicLink: RequestHandler = async (req, res, next) => {
  try {
    const magicToken = req.headers['x-magic-token'] as string | undefined;

    // Try Clerk auth first
    const auth = getAuth(req);
    if (auth.userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId },
      });

      if (user) {
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).clerkId = auth.userId;
        return next();
      }
    }

    // Try Magic Link token
    if (magicToken) {
      const magicLinkRecord = await prisma.magicLinkToken.findUnique({
        where: { token: magicToken },
        include: {
          participant: true,
          exchange: true,
          user: true,
        },
      });

      if (!magicLinkRecord) {
        throw new AppError('UNAUTHORIZED', 'Invalid magic link token', 401);
      }

      if (magicLinkRecord.expiresAt < new Date()) {
        throw new AppError('UNAUTHORIZED', 'Magic link has expired', 401);
      }

      // Attach magic link context to request
      (req as MagicLinkAuthRequest).magicLink = {
        token: magicToken,
        participant: magicLinkRecord.participant,
        exchange: magicLinkRecord.exchange,
        user: magicLinkRecord.user,
      };

      // If user is linked, also attach user
      if (magicLinkRecord.user) {
        (req as AuthenticatedRequest).user = magicLinkRecord.user;
      }

      return next();
    }

    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('UNAUTHORIZED', 'Authentication failed', 401));
    }
  }
};

/**
 * Optional auth - attaches user if authenticated, but doesn't require it
 * Used for public endpoints that behave differently for logged-in users
 */
export const optionalAuth: RequestHandler = async (req, _res, next) => {
  try {
    const auth = getAuth(req);

    if (auth.userId) {
      const user = await prisma.user.findUnique({
        where: { clerkId: auth.userId },
      });

      if (user) {
        (req as AuthenticatedRequest).user = user;
        (req as AuthenticatedRequest).clerkId = auth.userId;
      }
    }

    next();
  } catch {
    // Any error, continue without auth
    next();
  }
};

/**
 * Middleware to require premium subscription
 */
export const requirePremium: RequestHandler = async (req, _res, next) => {
  const authReq = req as AuthenticatedRequest;

  if (!authReq.user) {
    return next(new AppError('UNAUTHORIZED', 'Authentication required', 401));
  }

  if (!authReq.user.isPremium) {
    return next(new AppError('FORBIDDEN', 'Premium subscription required', 403));
  }

  next();
};
