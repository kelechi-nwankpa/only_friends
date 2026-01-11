import type { RequestHandler } from 'express';
import { prisma } from '../config/database.js';
import type { AuthenticatedRequest } from '../types/auth.types.js';
import { AppError } from '../utils/errors.js';
import { generateInviteCode as generateCode } from '../utils/crypto.js';
import type { CreateGroupInput, UpdateGroupInput } from '../validators/group.validator.js';

/**
 * Get all groups for current user
 */
export const getGroups: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;

    const memberships = await prisma.groupMember.findMany({
      where: { userId: user.id },
      include: {
        group: {
          include: {
            _count: { select: { members: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        groups: memberships.map(m => ({
          id: m.group.id,
          name: m.group.name,
          description: m.group.description,
          avatarUrl: m.group.avatarUrl,
          role: m.role,
          memberCount: m.group._count.members,
          joinedAt: m.joinedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new group
 */
export const createGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const input = req.body as CreateGroupInput;

    const group = await prisma.group.create({
      data: {
        name: input.name,
        description: input.description,
        createdBy: user.id,
        inviteCode: generateCode(),
        members: {
          create: {
            userId: user.id,
            role: 'admin',
          },
        },
      },
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single group with members
 */
export const getGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    // Check membership
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (!membership) {
      throw AppError.forbidden('You are not a member of this group');
    }

    const group = await prisma.group.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true, email: true } },
          },
        },
      },
    });

    if (!group) {
      throw AppError.notFound('Group not found');
    }

    res.json({
      success: true,
      data: {
        id: group.id,
        name: group.name,
        description: group.description,
        avatarUrl: group.avatarUrl,
        inviteCode: membership.role === 'admin' ? group.inviteCode : undefined,
        members: group.members.map(m => ({
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
        myRole: membership.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a group
 */
export const updateGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;
    const input = req.body as UpdateGroupInput;

    // Check admin role
    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (!membership || membership.role !== 'admin') {
      throw AppError.forbidden('Only admins can update the group');
    }

    const updated = await prisma.group.update({
      where: { id },
      data: {
        ...(input.name && { name: input.name }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.avatarUrl !== undefined && { avatarUrl: input.avatarUrl }),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a group
 */
export const deleteGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const group = await prisma.group.findUnique({ where: { id } });

    if (!group) {
      throw AppError.notFound('Group not found');
    }

    if (group.createdBy !== user.id) {
      throw AppError.forbidden('Only the group creator can delete the group');
    }

    await prisma.group.delete({ where: { id } });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate new invite code
 */
export const generateInviteCode: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (!membership || membership.role !== 'admin') {
      throw AppError.forbidden('Only admins can regenerate invite codes');
    }

    const newCode = generateCode();

    await prisma.group.update({
      where: { id },
      data: { inviteCode: newCode },
    });

    res.json({
      success: true,
      data: { inviteCode: newCode },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Join a group via invite code
 */
export const joinGroup: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { code } = req.params;

    const group = await prisma.group.findUnique({
      where: { inviteCode: code },
    });

    if (!group) {
      throw AppError.notFound('Invalid invite code');
    }

    // Check if already a member
    const existing = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: group.id, userId: user.id } },
    });

    if (existing) {
      // Already a member - return success with alreadyMember flag
      res.json({
        success: true,
        data: {
          groupId: group.id,
          groupName: group.name,
          alreadyMember: true,
        },
      });
      return;
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: user.id,
        role: 'member',
      },
    });

    res.json({
      success: true,
      data: {
        groupId: group.id,
        groupName: group.name,
        alreadyMember: false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get group members
 */
export const getMembers: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (!membership) {
      throw AppError.forbidden('You are not a member of this group');
    }

    const members = await prisma.groupMember.findMany({
      where: { groupId: id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });

    res.json({
      success: true,
      data: {
        members: members.map(m => ({
          ...m.user,
          role: m.role,
          joinedAt: m.joinedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove a member from group
 */
export const removeMember: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id, userId } = req.params;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (!membership || membership.role !== 'admin') {
      throw AppError.forbidden('Only admins can remove members');
    }

    if (userId === user.id) {
      throw AppError.badRequest('You cannot remove yourself');
    }

    await prisma.groupMember.delete({
      where: { groupId_userId: { groupId: id, userId } },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all wishlists shared with a group
 */
export const getGroupWishlists: RequestHandler = async (req, res, next) => {
  try {
    const { user } = req as AuthenticatedRequest;
    const { id } = req.params;

    const membership = await prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId: id, userId: user.id } },
    });

    if (!membership) {
      throw AppError.forbidden('You are not a member of this group');
    }

    const shares = await prisma.wishlistGroupShare.findMany({
      where: { groupId: id },
      include: {
        wishlist: {
          include: {
            owner: { select: { id: true, name: true, avatarUrl: true } },
            _count: { select: { items: true } },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        wishlists: shares.map(s => ({
          id: s.wishlist.id,
          title: s.wishlist.title,
          type: s.wishlist.type,
          owner: s.wishlist.owner,
          itemCount: s.wishlist._count.items,
          sharedAt: s.sharedAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
