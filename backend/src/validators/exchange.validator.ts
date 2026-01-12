import { z } from 'zod';
import { uuidSchema, emailSchema, phoneSchema, priceSchema, currencySchema } from './common.validator.js';

// Accept both date-only (YYYY-MM-DD) and full datetime formats
const dateStringSchema = z.string().refine(
  (val) => !isNaN(Date.parse(val)),
  { message: 'Invalid date format' }
);

export const createExchangeSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  groupId: uuidSchema.optional(),
  budgetMin: priceSchema,
  budgetMax: priceSchema,
  currency: currencySchema,
  drawDate: dateStringSchema.optional(),
  exchangeDate: dateStringSchema.optional(),
  isIncognito: z.boolean().default(false),
});

export const updateExchangeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  budgetMin: priceSchema.nullable(),
  budgetMax: priceSchema.nullable(),
  currency: currencySchema.optional(),
  drawDate: dateStringSchema.optional().nullable(),
  exchangeDate: dateStringSchema.optional().nullable(),
  isIncognito: z.boolean().optional(),
});

export const addParticipantSchema = z.object({
  name: z.string().min(1).max(100),
  email: emailSchema.optional(),
  phone: phoneSchema,
});

export const updateParticipantSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: emailSchema.optional().nullable(),
  phone: phoneSchema.nullable(),
  wishlistId: uuidSchema.optional().nullable(),
});

export const addExclusionSchema = z.object({
  participantAId: uuidSchema,
  participantBId: uuidSchema,
  reason: z.enum(['spouse', 'same_household', 'custom']).optional(),
});

export const sendInvitesSchema = z.object({
  method: z.enum(['email', 'sms']),
  participantIds: z.array(uuidSchema).optional(), // If not provided, send to all without accounts
});

// Types
export type CreateExchangeInput = z.infer<typeof createExchangeSchema>;
export type UpdateExchangeInput = z.infer<typeof updateExchangeSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type AddExclusionInput = z.infer<typeof addExclusionSchema>;
