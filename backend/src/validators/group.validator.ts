import { z } from 'zod';
import { uuidSchema } from './common.validator.js';

export const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const joinGroupSchema = z.object({
  code: z.string().min(1),
});

export const removeMemberSchema = z.object({
  userId: uuidSchema,
});

// Types
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
