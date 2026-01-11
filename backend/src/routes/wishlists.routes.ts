import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import { idParamSchema } from '../validators/common.validator.js';
import {
  createWishlistSchema,
  updateWishlistSchema,
  createItemSchema,
  reorderItemsSchema,
  shareWithGroupSchema,
  shareWithUserSchema,
} from '../validators/wishlist.validator.js';
import {
  getWishlists,
  createWishlist,
  getWishlist,
  updateWishlist,
  deleteWishlist,
  archiveWishlist,
  generateShareLink,
  revokeShareLink,
  shareWithGroup,
  unshareWithGroup,
  shareWithUser,
  unshareWithUser,
  getShares,
  addItem,
  reorderItems,
} from '../controllers/wishlists.controller.js';

const router = Router();

// All routes require authentication
router.use(requireAuth);

// Wishlist CRUD
router.get('/', getWishlists);
router.post('/', validateBody(createWishlistSchema), createWishlist);
router.get('/:id', validateParams(idParamSchema), getWishlist);
router.patch('/:id', validateParams(idParamSchema), validateBody(updateWishlistSchema), updateWishlist);
router.delete('/:id', validateParams(idParamSchema), deleteWishlist);

// Archive
router.post('/:id/archive', validateParams(idParamSchema), archiveWishlist);

// Share link
router.post('/:id/share-link', validateParams(idParamSchema), generateShareLink);
router.delete('/:id/share-link', validateParams(idParamSchema), revokeShareLink);

// Sharing with groups
router.post('/:id/share/group', validateParams(idParamSchema), validateBody(shareWithGroupSchema), shareWithGroup);
router.delete('/:id/share/group/:groupId', unshareWithGroup);

// Sharing with users
router.post('/:id/share/user', validateParams(idParamSchema), validateBody(shareWithUserSchema), shareWithUser);
router.delete('/:id/share/user/:userId', unshareWithUser);

// Get all shares
router.get('/:id/shares', validateParams(idParamSchema), getShares);

// Items
router.post('/:id/items', validateParams(idParamSchema), validateBody(createItemSchema), addItem);
router.post('/:id/items/reorder', validateParams(idParamSchema), validateBody(reorderItemsSchema), reorderItems);

export default router;
