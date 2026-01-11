import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';
import { AppError } from '../utils/errors.js';

/**
 * Get current authenticated user
 */
export const getMe: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        isPremium: user.isPremium,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update current user profile
 */
export const updateMe: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { name, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
        isPremium: updatedUser.isPremium,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search users by email or name
 */
export const searchUsers: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const query = req.query.q as string;

    if (!query || query.length < 3) {
      throw AppError.badRequest('Search query must be at least 3 characters');
    }

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: user.id } }, // Exclude self
          {
            OR: [
              { email: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
      },
      take: 10,
    });

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Register push notification token
 */
export const registerPushToken: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { token, platform, deviceName } = req.body;

    if (!token || !platform) {
      throw AppError.badRequest('Token and platform are required');
    }

    await prisma.pushToken.upsert({
      where: {
        userId_token: { userId: user.id, token },
      },
      create: {
        userId: user.id,
        token,
        platform,
        deviceName,
      },
      update: {
        platform,
        deviceName,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove push notification token
 */
export const removePushToken: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { token } = req.body;

    if (!token) {
      throw AppError.badRequest('Token is required');
    }

    await prisma.pushToken.delete({
      where: {
        userId_token: { userId: user.id, token },
      },
    }).catch(() => {
      // Token might not exist, ignore
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
