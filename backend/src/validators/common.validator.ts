import { z } from 'zod';

// Common schemas
export const uuidSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const idParamSchema = z.object({
  id: uuidSchema,
});

// Reusable field schemas
export const emailSchema = z.string().email();
export const phoneSchema = z.string().regex(/^\+?[1-9]\d{1,14}$/).optional();
export const urlSchema = z.string().url().optional();
export const priceSchema = z.coerce.number().positive().optional();
export const currencySchema = z.string().length(3).default('USD');

export const prioritySchema = z.enum(['low', 'medium', 'high']).default('medium');
export const visibilitySchema = z.enum(['private', 'shared', 'public']).default('private');
export const wishlistTypeSchema = z.enum([
  'general',
  'birthday',
  'christmas',
  'wedding',
  'baby',
  'home',
]).default('general');
