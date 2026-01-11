import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import type { OptionalAuthRequest } from '../types/auth.types.js';
import { AppError } from '../utils/errors.js';

/**
 * Get a public wishlist by share slug
 * No authentication required, but optional auth for reservation visibility
 */
export const getPublicWishlist: RequestHandler = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const { user } = req as OptionalAuthRequest;

    const wishlist = await prisma.wishlist.findUnique({
      where: { shareSlug: slug },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        items: {
          orderBy: { position: 'asc' },
          include: {
            reservation: {
              include: {
                reserver: { select: { id: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    // Check if it's the owner viewing their own list
    const isOwner = user?.id === wishlist.ownerId;

    // Build items with appropriate reservation visibility
    const items = wishlist.items.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl,
      price: item.price,
      currency: item.currency,
      notes: item.notes,
      priority: item.priority,
      // Owner never sees reservations, even on public link
      // Non-authenticated users don't see reservations either (they need to login)
      // Only authenticated non-owners see reservations
      reservation: (!isOwner && user && item.reservation) ? {
        status: item.reservation.status,
        reserver: item.reservation.reserver,
      } : null,
    }));

    res.json({
      success: true,
      data: {
        id: wishlist.id,
        title: wishlist.title,
        description: wishlist.description,
        type: wishlist.type,
        owner: wishlist.owner,
        items,
        isOwner,
        isAuthenticated: !!user,
      },
    });
  } catch (error) {
    next(error);
  }
};
