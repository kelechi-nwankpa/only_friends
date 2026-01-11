import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';
import { AppError } from '../utils/errors.js';
import type { UpdateItemInput } from '../validators/wishlist.validator.js';

/**
 * Get a single item
 */
export const getItem: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      include: {
        wishlist: { select: { ownerId: true } },
        reservation: {
          include: {
            reserver: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!item) {
      throw AppError.notFound('Item not found');
    }

    const isOwner = item.wishlist.ownerId === user.id;

    res.json({
      success: true,
      data: {
        id: item.id,
        title: item.title,
        url: item.url,
        imageUrl: item.imageUrl,
        price: item.price,
        currency: item.currency,
        notes: item.notes,
        priority: item.priority,
        position: item.position,
        reservation: isOwner ? null : item.reservation,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an item
 */
export const updateItem: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const input = req.body as UpdateItemInput;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      include: { wishlist: { select: { ownerId: true } } },
    });

    if (!item) {
      throw AppError.notFound('Item not found');
    }

    if (item.wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only update items in your own wishlists');
    }

    const updated = await prisma.wishlistItem.update({
      where: { id },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.url !== undefined && { url: input.url }),
        ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.currency && { currency: input.currency }),
        ...(input.notes !== undefined && { notes: input.notes }),
        ...(input.priority && { priority: input.priority }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an item
 */
export const deleteItem: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      include: { wishlist: { select: { ownerId: true } } },
    });

    if (!item) {
      throw AppError.notFound('Item not found');
    }

    if (item.wishlist.ownerId !== user.id) {
      throw AppError.forbidden('You can only delete items from your own wishlists');
    }

    await prisma.wishlistItem.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Reserve an item
 * CRITICAL: Cannot reserve items in your own wishlist
 */
export const reserveItem: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const item = await prisma.wishlistItem.findUnique({
      where: { id },
      include: {
        wishlist: { select: { ownerId: true } },
        reservation: true,
      },
    });

    if (!item) {
      throw AppError.notFound('Item not found');
    }

    // CRITICAL: Cannot reserve your own items
    if (item.wishlist.ownerId === user.id) {
      throw AppError.forbidden('You cannot reserve items from your own wishlist');
    }

    // Check if already reserved
    if (item.reservation) {
      throw AppError.conflict('This item is already reserved');
    }

    const reservation = await prisma.reservation.create({
      data: {
        itemId: id,
        reserverId: user.id,
        status: 'reserved',
      },
      include: {
        reserver: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: { reservation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Release a reservation
 */
export const releaseReservation: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { itemId: id },
    });

    if (!reservation) {
      throw AppError.notFound('No reservation found for this item');
    }

    if (reservation.reserverId !== user.id) {
      throw AppError.forbidden('You can only release your own reservations');
    }

    await prisma.reservation.delete({ where: { itemId: id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Update reservation status (e.g., mark as purchased)
 */
export const updateReservation: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { status, notes } = req.body;

    const reservation = await prisma.reservation.findUnique({
      where: { itemId: id },
    });

    if (!reservation) {
      throw AppError.notFound('No reservation found for this item');
    }

    if (reservation.reserverId !== user.id) {
      throw AppError.forbidden('You can only update your own reservations');
    }

    const updated = await prisma.reservation.update({
      where: { itemId: id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Enable price tracking for an item
 */
export const enablePriceAlert: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { targetPrice } = req.body;

    const item = await prisma.wishlistItem.findUnique({ where: { id } });

    if (!item) {
      throw AppError.notFound('Item not found');
    }

    if (!item.url) {
      throw AppError.badRequest('Price tracking requires an item URL');
    }

    await prisma.priceAlert.upsert({
      where: { userId_itemId: { userId: user.id, itemId: id } },
      create: {
        userId: user.id,
        itemId: id,
        targetPrice,
        isActive: true,
      },
      update: {
        targetPrice,
        isActive: true,
      },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Disable price tracking for an item
 */
export const disablePriceAlert: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    await prisma.priceAlert.delete({
      where: { userId_itemId: { userId: user.id, itemId: id } },
    }).catch(() => {
      // Not tracking, ignore
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get price history for an item
 */
export const getPriceHistory: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const history = await prisma.priceHistory.findMany({
      where: { itemId: id },
      orderBy: { recordedAt: 'desc' },
      take: 30,
    });

    res.json({
      success: true,
      data: { history },
    });
  } catch (error) {
    next(error);
  }
};
