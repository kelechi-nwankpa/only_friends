import { nanoid } from 'nanoid';

/**
 * Generate a secure random token for magic links
 */
export function generateMagicLinkToken(): string {
  return nanoid(32);
}

/**
 * Generate a short invite code for groups
 */
export function generateInviteCode(): string {
  return nanoid(8);
}

/**
 * Generate a share slug for wishlists
 */
export function generateShareSlug(): string {
  return nanoid(12);
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return nanoid();
}
