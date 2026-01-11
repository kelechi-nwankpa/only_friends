import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';
import { AppError } from '../utils/errors.js';
import { generateShareSlug } from '../utils/crypto.js';
import type { CreateWishlistInput, UpdateWishlistInput, CreateItemInput } from '../validators/wishlist.validator.js';

/**
 * Get all wishlists for current user
 */
export const getWishlists: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const includeArchived = req.query.include_archived === 'true';
    const type = req.query.type as string | undefined;

    const wishlists = await prisma.wishlist.findMany({
      where: {
        ownerId: user.id,
        ...(includeArchived ? {} : { isArchived: false }),
        ...(type ? { type } : {}),
      },
      include: {
        _count: { select: { items: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: {
        wishlists: wishlists.map(w => ({
          id: w.id,
          title: w.title,
          description: w.description,
          type: w.type,
          visibility: w.visibility,
          isArchived: w.isArchived,
          itemCount: w._count.items,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new wishlist
 */
export const createWishlist: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const input = req.body as CreateWishlistInput;

    const wishlist = await prisma.wishlist.create({
      data: {
        ownerId: user.id,
        title: input.title,
        description: input.description,
        type: input.type,
        visibility: input.visibility,
      },
    });

    res.status(201).json({
      success: true,
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single wishlist with items
 * CRITICAL: Strips reservation data if user is the owner
 */
export const getWishlist: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, avatarUrl: true },
        },
        items: {
          orderBy: { position: 'asc' },
          include: {
            reservation: {
              include: {
                reserver: {
                  select: { id: true, name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    // Check access
    const isOwner = wishlist.ownerId === user.id;
    const hasAccess = await checkWishlistAccess(wishlist.id, user.id);

    if (!isOwner && !hasAccess && wishlist.visibility === 'private') {
      throw AppError.forbidden('You do not have access to this wishlist');
    }

    // CRITICAL: Strip reservation data for owner
    const items = wishlist.items.map(item => ({
      id: item.id,
      title: item.title,
      url: item.url,
      imageUrl: item.imageUrl,
      price: item.price,
      currency: item.currency,
      notes: item.notes,
      priority: item.priority,
      position: item.position,
      // Owner NEVER sees reservation status
      reservation: isOwner ? null : item.reservation ? {
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
        visibility: wishlist.visibility,
        shareSlug: wishlist.shareSlug,
        isArchived: wishlist.isArchived,
        owner: wishlist.owner,
        isOwner,
        items,
        createdAt: wishlist.createdAt,
        updatedAt: wishlist.updatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a wishlist
 */
export const updateWishlist: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const input = req.body as UpdateWishlistInput;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    if (wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only update your own wishlists');
    }

    const updated = await prisma.wishlist.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.type && { type: input.type }),
        ...(input.visibility && { visibility: input.visibility }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a wishlist
 */
export const deleteWishlist: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    if (wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only delete your own wishlists');
    }

    await prisma.wishlist.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive a wishlist
 */
export const archiveWishlist: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    if (wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only archive your own wishlists');
    }

    await prisma.wishlist.update({
      where: { id },
      data: { isArchived: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a shareable link for a wishlist
 */
export const generateShareLink: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    if (wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only share your own wishlists');
    }

    const shareSlug = generateShareSlug();

    await prisma.wishlist.update({
      where: { id },
      data: { shareSlug },
    });

    res.json({
      success: true,
      data: {
        shareSlug,
        shareUrl: `${process.env.FRONTEND_URL}/list/${shareSlug}`,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Revoke a shareable link
 */
export const revokeShareLink: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist) {
      throw AppError.notFound('Wishlist not found');
    }

    if (wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only manage your own wishlists');
    }

    await prisma.wishlist.update({
      where: { id },
      data: { shareSlug: null },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Share wishlist with a group
 */
export const shareWithGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { groupId } = req.body;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only share your own wishlists');
    }

    // Verify user is member of the group
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    });

    if (!membership) {
      throw AppError.forbidden('You are not a member of this group');
    }

    await prisma.wishlistGroupShare.create({
      data: { wishlistId: id, groupId },
    }).catch(() => {
      // Already shared, ignore
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Unshare wishlist from a group
 */
export const unshareWithGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id, groupId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only manage your own wishlists');
    }

    await prisma.wishlistGroupShare.delete({
      where: { wishlistId_groupId: { wishlistId: id, groupId } },
    }).catch(() => {
      // Not shared, ignore
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Share wishlist with a specific user
 */
export const shareWithUser: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { userId } = req.body;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only share your own wishlists');
    }

    if (userId === user.id) {
      throw AppError.badRequest('You cannot share a wishlist with yourself');
    }

    await prisma.wishlistUserShare.create({
      data: {
        wishlistId: id,
        userId,
        sharedBy: user.id,
      },
    }).catch(() => {
      // Already shared, ignore
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Unshare wishlist from a specific user
 */
export const unshareWithUser: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id, userId } = req.params;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only manage your own wishlists');
    }

    await prisma.wishlistUserShare.delete({
      where: { wishlistId_userId: { wishlistId: id, userId } },
    }).catch(() => {
      // Not shared, ignore
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all shares for a wishlist
 */
export const getShares: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const wishlist = await prisma.wishlist.findUnique({
      where: { id },
      include: {
        groupShares: {
          include: { group: { select: { id: true, name: true } } },
        },
        userShares: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only view shares for your own wishlists');
    }

    res.json({
      success: true,
      data: {
        groups: wishlist.groupShares.map(s => s.group),
        users: wishlist.userShares.map(s => s.user),
        shareLink: wishlist.shareSlug ? {
          slug: wishlist.shareSlug,
          url: `${process.env.FRONTEND_URL}/list/${wishlist.shareSlug}`,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add item to wishlist
 */
export const addItem: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const input = req.body as CreateItemInput;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only add items to your own wishlists');
    }

    // Get max position
    const maxPosition = await prisma.wishlistItem.aggregate({
      where: { wishlistId: id },
      _max: { position: true },
    });

    const item = await prisma.wishlistItem.create({
      data: {
        wishlistId: id,
        title: input.title,
        url: input.url,
        imageUrl: input.imageUrl,
        price: input.price,
        currency: input.currency,
        notes: input.notes,
        priority: input.priority,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

/**
 * Reorder items in a wishlist
 */
export const reorderItems: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { items } = req.body;

    const wishlist = await prisma.wishlist.findUnique({ where: { id } });

    if (!wishlist || wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only reorder items in your own wishlists');
    }

    // Update positions in a transaction
    await prisma.$transaction(
      items.map((item: { id: string; position: number }) =>
        prisma.wishlistItem.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// Helper function to check wishlist access
async function checkWishlistAccess(wishlistId: string, userId: string): Promise<boolean> {
  // Check direct user share
  const userShare = await prisma.wishlistUserShare.findUnique({
    where: { wishlistId_userId: { wishlistId, userId } },
  });

  if (userShare) return true;

  // Check group shares
  const groupShares = await prisma.wishlistGroupShare.findMany({
    where: { wishlistId },
    select: { groupId: true },
  });

  for (const share of groupShares) {
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: share.groupId, userId } },
    });
    if (membership) return true;
  }

  return false;
}
