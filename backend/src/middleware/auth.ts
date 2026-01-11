import type { RequestHandler } from 'express';
import { clerkClient } from '@clerk/express';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import type { AuthenticatedRequest, MagicLinkAuthRequest } from '../types/auth.types.js';

/**
 * Middleware to require Clerk authentication
 * Extracts user from JWT and attaches to request
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('UNAUTHORIZED', 'Missing or invalid authorization header', 401);
    }

    const token = authHeader.substring(7);

    // Verify the token with Clerk
    const { sub: clerkId } = await clerkClient.verifyToken(token);

    if (!clerkId) {
      throw new AppError('UNAUTHORIZED', 'Invalid token', 401);
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      throw new AppError('UNAUTHORIZED', 'User not found', 401);
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).clerkId = clerkId;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
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
    const authHeader = req.headers.authorization;
    const magicToken = req.headers['x-magic-token'] as string | undefined;

    // Try Clerk auth first
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const { sub: clerkId } = await clerkClient.verifyToken(token);

        if (clerkId) {
          const user = await prisma.user.findUnique({
            where: { clerkId },
          });

          if (user) {
            (req as AuthenticatedRequest).user = user;
            (req as AuthenticatedRequest).clerkId = clerkId;
            return next();
          }
        }
      } catch {
        // Clerk auth failed, try magic link
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
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const { sub: clerkId } = await clerkClient.verifyToken(token);

        if (clerkId) {
          const user = await prisma.user.findUnique({
            where: { clerkId },
          });

          if (user) {
            (req as AuthenticatedRequest).user = user;
            (req as AuthenticatedRequest).clerkId = clerkId;
          }
        }
      } catch {
        // Auth failed, continue without user
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
