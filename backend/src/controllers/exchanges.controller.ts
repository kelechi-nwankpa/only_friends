import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import type { AuthenticatedRequest, MagicLinkAuthRequest } from '../types/auth.types.js';
import { AppError } from '../utils/errors.js';
import { generateMagicLinkToken } from '../utils/crypto.js';
import { drawNames as drawNamesAlgorithm, validateExclusions } from '../utils/secretSanta.js';
import { addDays } from '../utils/helpers.js';
import { config } from '../config/index.js';
import type { CreateExchangeInput, UpdateExchangeInput, AddParticipantInput } from '../validators/exchange.validator.js';

/**
 * Get all exchanges for current user
 */
export const getExchanges: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;

    const participations = await prisma.exchangeParticipant.findMany({
      where: { userId: user.id },
      include: {
        exchange: {
          include: {
            _count: { select: { participants: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        exchanges: participations.map(p => ({
          id: p.exchange.id,
          name: p.exchange.name,
          status: p.exchange.status,
          participantCount: p.exchange._count.participants,
          exchangeDate: p.exchange.exchangeDate,
          hasRevealed: p.hasRevealed,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new exchange
 */
export const createExchange: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const input = req.body as CreateExchangeInput;

    const exchange = await prisma.exchange.create({
      data: {
        name: input.name,
        description: input.description,
        groupId: input.groupId,
        budgetMin: input.budgetMin,
        budgetMax: input.budgetMax,
        currency: input.currency,
        drawDate: input.drawDate ? new Date(input.drawDate) : undefined,
        exchangeDate: input.exchangeDate ? new Date(input.exchangeDate) : undefined,
        isIncognito: input.isIncognito,
        createdBy: user.id,
        participants: {
          create: {
            userId: user.id,
            name: user.name,
            email: user.email,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: exchange });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single exchange
 */
export const getExchange: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest | MagicLinkAuthRequest;
    const { id } = req.params as { id: string };

    const exchange = await prisma.exchange.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            wishlist: { select: { id: true, title: true } },
            magicLinks: {
              where: { expiresAt: { gt: new Date() } },
              take: 1,
              select: { token: true },
            },
          },
        },
        exclusions: true,
        group: { select: { id: true, name: true } },
      },
    });

    if (!exchange) {
      throw AppError.notFound('Exchange not found');
    }

    // Check access
    const userId = authReq.user?.id;
    const magicLink = (authReq as MagicLinkAuthRequest).magicLink;

    const isParticipant = exchange.participants.some(
      p => p.userId === userId || (magicLink && p.id === magicLink.participant.id)
    );

    if (!isParticipant) {
      throw AppError.forbidden('You are not a participant in this exchange');
    }

    // Find current user's participant record
    const myParticipant = exchange.participants.find(
      p => p.userId === userId || (magicLink && p.id === magicLink.participant.id)
    );

    res.json({
      success: true,
      data: {
        id: exchange.id,
        name: exchange.name,
        description: exchange.description,
        status: exchange.status,
        budget: {
          min: exchange.budgetMin,
          max: exchange.budgetMax,
          currency: exchange.currency,
        },
        dates: {
          draw: exchange.drawDate,
          exchange: exchange.exchangeDate,
        },
        isIncognito: exchange.isIncognito,
        isOrganizer: exchange.createdBy === userId,
        group: exchange.group,
        myParticipant: myParticipant ? {
          id: myParticipant.id,
          name: myParticipant.name,
          hasWishlist: !!myParticipant.wishlistId,
          wishlistId: myParticipant.wishlistId,
          wishlistTitle: myParticipant.wishlist?.title,
        } : null,
        participants: exchange.participants.map(p => ({
          id: p.id,
          name: p.name,
          hasWishlist: !!p.wishlistId,
          hasJoined: !!p.userId,
          user: p.user,
          // Only include magic link for uninvited participants
          magicLink: !p.userId && p.magicLinks?.[0]?.token
            ? `${config.frontendUrl}/magic/${p.magicLinks[0].token}`
            : undefined,
        })),
        exclusionCount: exchange.exclusions.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an exchange
 */
export const updateExchange: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const input = req.body as UpdateExchangeInput;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange) {
      throw AppError.notFound('Exchange not found');
    }

    if (exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can update the exchange');
    }

    if (exchange.status !== 'open') {
      throw AppError.badRequest('Cannot update exchange after names have been drawn');
    }

    const updated = await prisma.exchange.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.budgetMin !== undefined && { budgetMin: input.budgetMin }),
        ...(input.budgetMax !== undefined && { budgetMax: input.budgetMax }),
        ...(input.currency && { currency: input.currency }),
        ...(input.drawDate !== undefined && { drawDate: input.drawDate ? new Date(input.drawDate) : null }),
        ...(input.exchangeDate !== undefined && { exchangeDate: input.exchangeDate ? new Date(input.exchangeDate) : null }),
        ...(input.isIncognito !== undefined && { isIncognito: input.isIncognito }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an exchange
 */
export const deleteExchange: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange) {
      throw AppError.notFound('Exchange not found');
    }

    if (exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can delete the exchange');
    }

    await prisma.exchange.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get participants
 */
export const getParticipants: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const participants = await prisma.exchangeParticipant.findMany({
      where: { exchangeId: id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        wishlist: { select: { id: true, title: true } },
      },
    });

    res.json({
      success: true,
      data: { participants },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a participant
 */
export const addParticipant: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const input = req.body as AddParticipantInput;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange) {
      throw AppError.notFound('Exchange not found');
    }

    if (exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can add participants');
    }

    if (exchange.status !== 'open') {
      throw AppError.badRequest('Cannot add participants after names have been drawn');
    }

    // Create participant
    const participant = await prisma.exchangeParticipant.create({
      data: {
        exchangeId: id,
        name: input.name,
        email: input.email,
        phone: input.phone,
      },
    });

    // Generate magic link
    const token = generateMagicLinkToken();
    await prisma.magicLinkToken.create({
      data: {
        token,
        exchangeId: id,
        participantId: participant.id,
        expiresAt: addDays(new Date(), config.magicLink.expiryDays),
      },
    });

    const magicLink = `${config.frontendUrl}/magic/${token}`;

    res.status(201).json({
      success: true,
      data: {
        participant,
        magicLink,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a participant
 * - Organizers can update name, email, phone
 * - Participants can only update their own wishlistId
 */
export const updateParticipant: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id, participantId } = req.params as { id: string; participantId: string };
    const { name, email, phone, wishlistId } = req.body;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange) {
      throw AppError.notFound('Exchange not found');
    }

    const isOrganizer = exchange.createdBy === user.id;

    // Get the participant to check ownership
    const participant = await prisma.exchangeParticipant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      throw AppError.notFound('Participant not found');
    }

    const isOwnParticipant = participant.userId === user.id;

    // Authorization checks
    if (!isOrganizer && !isOwnParticipant) {
      throw AppError.forbidden('You can only update your own participation');
    }

    // Build update data based on permissions
    const updateData: { name?: string; email?: string | null; phone?: string | null; wishlistId?: string | null } = {};

    // Organizers can update name, email, phone
    if (isOrganizer) {
      if (name) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
    }

    // Both organizers and participants can update wishlistId (but only their own for participants)
    if (wishlistId !== undefined) {
      if (isOwnParticipant || isOrganizer) {
        // Verify the wishlist belongs to the participant's linked user
        if (wishlistId !== null) {
          const wishlist = await prisma.wishlist.findUnique({
            where: { id: wishlistId },
          });

          // For self-linking, verify the wishlist belongs to the current user
          if (isOwnParticipant && !isOrganizer) {
            if (!wishlist || wishlist.ownerId !== user.id) {
              throw AppError.forbidden('You can only link your own wishlists');
            }
          }
        }
        updateData.wishlistId = wishlistId;
      }
    }

    const updated = await prisma.exchangeParticipant.update({
      where: { id: participantId },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a participant
 */
export const removeParticipant: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id, participantId } = req.params;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can remove participants');
    }

    if (exchange.status !== 'open') {
      throw AppError.badRequest('Cannot remove participants after names have been drawn');
    }

    await prisma.exchangeParticipant.delete({ where: { id: participantId } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Send invites via email or SMS
 */
export const sendInvites: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { method, participantIds } = req.body;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can send invites');
    }

    // Get participants to invite
    const participants = await prisma.exchangeParticipant.findMany({
      where: {
        exchangeId: id,
        ...(participantIds ? { id: { in: participantIds } } : { userId: null }),
      },
      include: {
        magicLinks: { where: { expiresAt: { gt: new Date() } }, take: 1 },
      },
    });

    // TODO: Actually send emails/SMS using Resend/Twilio
    // For now, just return the count
    const toSend = participants.filter(p => {
      if (method === 'email') return !!p.email;
      if (method === 'sms') return !!p.phone;
      return false;
    });

    res.json({
      success: true,
      data: {
        sent: toSend.length,
        method,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exclusions
 */
export const getExclusions: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can view exclusions');
    }

    const exclusions = await prisma.exchangeExclusion.findMany({
      where: { exchangeId: id },
      include: {
        participantARelation: { select: { id: true, name: true } },
        participantBRelation: { select: { id: true, name: true } },
      },
    });

    res.json({
      success: true,
      data: {
        exclusions: exclusions.map(e => ({
          id: e.id,
          participantA: e.participantARelation,
          participantB: e.participantBRelation,
          reason: e.reason,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add an exclusion
 */
export const addExclusion: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { participantAId, participantBId, reason } = req.body;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can add exclusions');
    }

    if (exchange.status !== 'open') {
      throw AppError.badRequest('Cannot add exclusions after names have been drawn');
    }

    const exclusion = await prisma.exchangeExclusion.create({
      data: {
        exchangeId: id,
        participantA: participantAId,
        participantB: participantBId,
        reason,
      },
    });

    res.status(201).json({ success: true, data: exclusion });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove an exclusion
 */
export const removeExclusion: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id, exclusionId } = req.params;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can remove exclusions');
    }

    await prisma.exchangeExclusion.delete({ where: { id: exclusionId } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Draw names
 */
export const drawNames: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const exchange = await prisma.exchange.findUnique({
      where: { id },
      include: {
        participants: true,
        exclusions: true,
      },
    });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can draw names');
    }

    if (exchange.status !== 'open') {
      throw AppError.badRequest('Names have already been drawn');
    }

    if (exchange.participants.length < 2) {
      throw AppError.badRequest('Need at least 2 participants to draw names');
    }

    // Validate exclusions first
    const validation = validateExclusions(
      exchange.participants.map(p => ({ id: p.id, name: p.name })),
      exchange.exclusions.map(e => ({ participantA: e.participantA, participantB: e.participantB }))
    );

    if (!validation.valid) {
      throw AppError.badRequest(validation.reason || 'Invalid exclusions');
    }

    // Draw names
    const assignments = drawNamesAlgorithm(
      exchange.participants.map(p => ({ id: p.id, name: p.name })),
      exchange.exclusions.map(e => ({ participantA: e.participantA, participantB: e.participantB }))
    );

    // Save assignments
    await prisma.$transaction([
      prisma.exchangeAssignment.createMany({
        data: assignments.map(a => ({
          exchangeId: id,
          giverId: a.giverId,
          receiverId: a.receiverId,
        })),
      }),
      prisma.exchange.update({
        where: { id },
        data: {
          status: 'drawn',
          ...(exchange.isIncognito && {
            incognitoDeleteAt: addDays(
              exchange.exchangeDate || new Date(),
              30
            ),
          }),
        },
      }),
    ]);

    res.json({
      success: true,
      message: 'Names drawn successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Redraw names (reset and draw again)
 */
export const redrawNames: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const exchange = await prisma.exchange.findUnique({ where: { id } });

    if (!exchange || exchange.createdBy !== user.id) {
      throw AppError.forbidden('Only the organizer can redraw names');
    }

    // Delete existing assignments and reset status
    await prisma.$transaction([
      prisma.exchangeAssignment.deleteMany({ where: { exchangeId: id } }),
      prisma.exchangeParticipant.updateMany({
        where: { exchangeId: id },
        data: { hasRevealed: false },
      }),
      prisma.exchange.update({
        where: { id },
        data: { status: 'open' },
      }),
    ]);

    res.json({
      success: true,
      message: 'Exchange reset. You can now draw names again.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get my assignment
 */
export const getMyAssignment: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest | MagicLinkAuthRequest;
    const { id } = req.params;

    const userId = authReq.user?.id;
    const magicLink = (authReq as MagicLinkAuthRequest).magicLink;

    // Find my participant record
    const participant = await prisma.exchangeParticipant.findFirst({
      where: {
        exchangeId: id,
        OR: [
          { userId },
          ...(magicLink ? [{ id: magicLink.participant.id }] : []),
        ],
      },
    });

    if (!participant) {
      throw AppError.forbidden('You are not a participant in this exchange');
    }

    // Get assignment
    const assignment = await prisma.exchangeAssignment.findUnique({
      where: {
        exchangeId_giverId: { exchangeId: id, giverId: participant.id },
      },
      include: {
        receiver: {
          include: {
            wishlist: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!assignment) {
      res.json({
        success: true,
        data: {
          assignment: null,
          hasRevealed: participant.hasRevealed,
        },
      });
      return;
    }

    res.json({
      success: true,
      data: {
        receiver: {
          id: assignment.receiver.id,
          name: assignment.receiver.name,
          wishlistId: assignment.receiver.wishlistId,
          wishlistTitle: assignment.receiver.wishlist?.title,
        },
        hasRevealed: participant.hasRevealed,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark assignment as revealed (for animation trigger)
 */
export const revealAssignment: RequestHandler = async (req, res, next) => {
  try {
    const authReq = req as AuthenticatedRequest | MagicLinkAuthRequest;
    const { id } = req.params;

    const userId = authReq.user?.id;
    const magicLink = (authReq as MagicLinkAuthRequest).magicLink;

    await prisma.exchangeParticipant.updateMany({
      where: {
        exchangeId: id,
        OR: [
          { userId },
          ...(magicLink ? [{ id: magicLink.participant.id }] : []),
        ],
      },
      data: { hasRevealed: true },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get chat messages
 */
export const getMessages: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const messages = await prisma.chatMessage.findMany({
      where: { exchangeId: id },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'asc' },
      take: 100,
    });

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a chat message
 */
export const sendMessage: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const { message } = req.body;

    if (!user) {
      throw AppError.forbidden('Must be logged in to send messages');
    }

    if (!message || message.trim().length === 0) {
      throw AppError.badRequest('Message cannot be empty');
    }

    const chatMessage = await prisma.chatMessage.create({
      data: {
        exchangeId: id,
        senderId: user.id,
        message: message.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    res.status(201).json({ success: true, data: chatMessage });
  } catch (error) {
    next(error);
  }
};
