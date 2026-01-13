import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';

/**
 * Validate a magic link token and return exchange context
 * No authentication required
 */
export const validateMagicLink: RequestHandler = async (req, res, next) => {
  try {
    const { token } = req.params as { token: string };

    const magicLink = await prisma.magicLinkToken.findUnique({
      where: { token },
      include: {
        participant: {
          include: {
            wishlist: { select: { id: true, title: true } },
          },
        },
        exchange: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            budgetMin: true,
            budgetMax: true,
            currency: true,
            exchangeDate: true,
          },
        },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!magicLink) {
      throw AppError.notFound('Invalid or expired magic link');
    }

    if (magicLink.expiresAt < new Date()) {
      throw AppError.badRequest('This magic link has expired');
    }

    // Mark as used if first time
    if (!magicLink.usedAt) {
      await prisma.magicLinkToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
    }

    // Get assignment if names have been drawn
    let assignment = null;
    if (magicLink.exchange.status === 'drawn') {
      const assignmentRecord = await prisma.exchangeAssignment.findUnique({
        where: {
          exchangeId_giverId: {
            exchangeId: magicLink.exchange.id,
            giverId: magicLink.participant.id,
          },
        },
        include: {
          receiver: {
            include: {
              wishlist: { select: { id: true, title: true } },
            },
          },
        },
      });

      if (assignmentRecord) {
        assignment = {
          receiver: {
            id: assignmentRecord.receiver.id,
            name: assignmentRecord.receiver.name,
            wishlistId: assignmentRecord.receiver.wishlistId,
            wishlistTitle: assignmentRecord.receiver.wishlist?.title,
          },
        };
      }
    }

    res.json({
      success: true,
      data: {
        valid: true,
        token,
        participant: {
          id: magicLink.participant.id,
          name: magicLink.participant.name,
          hasRevealed: magicLink.participant.hasRevealed,
          wishlistId: magicLink.participant.wishlistId,
          wishlistTitle: magicLink.participant.wishlist?.title,
        },
        exchange: magicLink.exchange,
        assignment,
        linkedUser: magicLink.user ? {
          id: magicLink.user.id,
          name: magicLink.user.name,
        } : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Claim a magic link - link the authenticated user to the participant
 * Requires authentication
 */
export const claimMagicLink: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { token } = req.params as { token: string };

    const magicLink = await prisma.magicLinkToken.findUnique({
      where: { token },
      include: {
        participant: true,
        exchange: { select: { id: true, name: true } },
      },
    });

    if (!magicLink) {
      throw AppError.notFound('Invalid or expired magic link');
    }

    if (magicLink.expiresAt < new Date()) {
      throw AppError.badRequest('This magic link has expired');
    }

    // Check if participant is already linked to a different user
    if (magicLink.participant.userId && magicLink.participant.userId !== user.id) {
      throw AppError.badRequest('This invite has already been claimed by another user');
    }

    // Check if this user is already a participant in this exchange
    const existingParticipation = await prisma.exchangeParticipant.findFirst({
      where: {
        exchangeId: magicLink.exchangeId,
        userId: user.id,
        id: { not: magicLink.participantId }, // Exclude the current participant being claimed
      },
    });

    if (existingParticipation) {
      throw AppError.badRequest('You are already a participant in this exchange');
    }

    // Link the user to the participant
    await prisma.exchangeParticipant.update({
      where: { id: magicLink.participantId },
      data: {
        userId: user.id,
        email: user.email, // Update email to match the signed-in user
      },
    });

    // Also link the magic link token to the user for reference
    await prisma.magicLinkToken.update({
      where: { token },
      data: { userId: user.id },
    });

    res.json({
      success: true,
      data: {
        message: 'Successfully joined the exchange',
        exchangeId: magicLink.exchangeId,
        exchangeName: magicLink.exchange.name,
      },
    });
  } catch (error) {
    next(error);
  }
};
