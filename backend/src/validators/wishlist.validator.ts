import { z } from 'zod';
import {
  uuidSchema,
  visibilitySchema,
  wishlistTypeSchema,
  prioritySchema,
  urlSchema,
  priceSchema,
  currencySchema,
} from './common.validator.js';

// Wishlist schemas
export const createWishlistSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  type: wishlistTypeSchema,
  visibility: visibilitySchema,
});

export const updateWishlistSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  type: wishlistTypeSchema.optional(),
  visibility: visibilitySchema.optional(),
});

// Item schemas
export const createItemSchema = z.object({
  title: z.string().min(1).max(200),
  url: urlSchema,
  imageUrl: urlSchema,
  price: priceSchema,
  currency: currencySchema,
  notes: z.string().max(500).optional(),
  priority: prioritySchema,
});

export const updateItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  url: urlSchema.nullable(),
  imageUrl: urlSchema.nullable(),
  price: priceSchema.nullable(),
  currency: currencySchema.optional(),
  notes: z.string().max(500).optional().nullable(),
  priority: prioritySchema.optional(),
});

export const reorderItemsSchema = z.object({
  items: z.array(z.object({
    id: uuidSchema,
    position: z.number().int().min(0),
  })),
});

// Sharing schemas
export const shareWithGroupSchema = z.object({
  groupId: uuidSchema,
});

export const shareWithUserSchema = z.object({
  userId: uuidSchema,
});

// Reservation schemas
export const updateReservationSchema = z.object({
  status: z.enum(['reserved', 'purchased']),
  notes: z.string().max(500).optional(),
});

// Types
export type CreateWishlistInput = z.infer<typeof createWishlistSchema>;
export type UpdateWishlistInput = z.infer<typeof updateWishlistSchema>;
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ReorderItemsInput = z.infer<typeof reorderItemsSchema>;
